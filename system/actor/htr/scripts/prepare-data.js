/* global TextEditor */

import { Edges } from '../../../api/def/edges.js'

export const prepareEdges = async function (actor) {
  // Secondary variables
  const edgesList = Edges.getList({})
  const edges = actor.system?.edges

  // Clean up non-existent edges, such as custom ones that no longer exist
  const validEdges = new Set(Object.keys(edgesList))
  for (const id of Object.keys(edges)) {
    if (!validEdges.has(id)) {
      delete edges[id]
    }
  }

  for (const [id, value] of Object.entries(edgesList)) {
    let edgeData = {}

    // If the actor has a edge with the key, grab its current values
    if (Object.prototype.hasOwnProperty.call(edges, id)) {
      edgeData = Object.assign({
        id,
        value: edges[id].value,
        perks: edges[id].perks || [],
        pools: edges[id].pools || [],
        description: edges[id].description,
        visible: edges[id].visible,
        selected: edges[id].selected || false
      }, value)
    } else { // Otherwise, add it to the actor and set it as some default data
      edgeData = Object.assign({
        id,
        value: 0,
        visible: false,
        description: '',
        perks: [],
        pools: [],
        selected: false
      }, value)
    }

    // Ensure the edge exists
    if (!edges[id]) edges[id] = {}
    // Apply the edge's data
    edges[id] = edgeData

    // Make it forced invisible if it's set to hidden
    if (edgeData.hidden) {
      edges[id].visible = false
    }

    // Wipe old edge perks so they doesn't duplicate
    edges[id].perks = []

    // Wipe old edge pools so they don't duplicate either
    edges[id].pools = []

    // Enrich edge description
    edges[id].enrichedDescription = await TextEditor.enrichHTML(edges[id].description)

    // Assign all matching perks to the edge
    edges[id].perks = actor.items.filter(item =>
      item.type === 'perk' && item.system.edge === id
    )

    // Assign all matching edgepools to the edge
    edges[id].pools = actor.items.filter(item =>
      item.type === 'edgepool' && item.system.edge === id
    )
  }

  return edges
}

export const prepareEdgePowers = async function (edges) {
  for (const edgeType in edges) {
    if (Object.prototype.hasOwnProperty.call(edges, edgeType)) {
      const edge = edges[edgeType]

      // Perk Sorting
      if (edge && Array.isArray(edge.perks)) {
        // Check if the edge has perks
        if (edge.perks.length > 0) {
          // Ensure visibility is set correctly
          if (!edge.visible && !edge.hidden) edge.visible = true

          // Sort the edge containers alphabetically
          edge.perks = edge.perks.sort(function (perk1, perk2) {
            return perk1.name.localeCompare(perk2.name)
          })
        }
      } else {
        console.warn(`Edge ${edgeType} is missing or perks is not an array.`)
      }

      // Edge Pool Sorting
      if (edge && Array.isArray(edge.pools)) {
        // Check if the edge has pools
        if (edge.pools.length > 0) {
          // Sort the edgepools containers alphabetically
          edge.pools = edge.pools.sort(function (pool1, pool2) {
            return pool1.name.localeCompare(pool2.name)
          })
        }
      } else {
        console.warn(`Edge ${edgeType} is missing or pools is not an array.`)
      }
    }
  }

  return edges
}
