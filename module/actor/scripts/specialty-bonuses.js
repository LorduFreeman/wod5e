export const _onAddBonus = async function (event, actor, data, SkillEditDialog) {
  // Top-level variables
  const header = event.currentTarget
  const skill = header.dataset.skill
  const bonusPath = header.dataset.bonusPath

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Secondary variables
  const bonusData = {
    actor,
    bonus: {
      source: 'New specialty',
      value: 1,
      paths: [`skills.${skill}`],
      displayWhenInactive: false,
      activeWhen: {
        check: 'always'
      }
    }
  }

  // Render the template
  const bonusTemplate = 'systems/vtm5e/templates/item/parts/bonus-display.hbs'
  const bonusContent = await renderTemplate(bonusTemplate, bonusData)

  new Dialog(
    {
      title: bonusData.bonus.source,
      content: bonusContent,
      buttons: {
        add: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("WOD5E.Add"),
          callback: async html => {
            let source, value, displayWhenInactive, rawPaths, arrPaths, cleanPaths
            let paths = []
            let activeWhen = {}
            let newBonus = {}

            source = html.find("[id=bonusSource]").val()
            value = html.find("[id=bonusValue]").val()
            displayWhenInactive = html.find("[id=displayBonusWhenInactive]").is(':checked')

            rawPaths = html.find("[id=bonusPaths]").val()
            arrPaths = rawPaths.split(";")
            cleanPaths = arrPaths.map(function(item) {
              return item.trim()
            })
            paths = cleanPaths.filter(function(item) {
              return item !== ""
            })

            activeWhen['check'] = html.find("[id=activeWhenCheck]").val()
            activeWhen['path'] = html.find("[id=activeWhenPath]").val()
            activeWhen['value'] = html.find("[id=activeWhenValue]").val()

            newBonus = {
              source,
              value,
              paths,
              displayWhenInactive,
              activeWhen
            }

            // Define the existing list of bonuses
            const parentKeys = bonusPath.split('.')
            let actorBonuses = parentKeys.reduce((obj, key) => obj && obj[key], actor.system) || { bonuses: [] }

            // Add the new bonus to the list
            actorBonuses.bonuses.push(newBonus)

            // Update the actor
            actor.update({ [`system.${bonusPath}`]: actorBonuses.bonuses })

            // Re-render the skill edit dialog
            SkillEditDialog.data.content = await renderTemplate('systems/vtm5e/templates/actor/parts/skill-dialog.hbs', {
              id: data.id,
              actor,
              system,
              skill: actor.system.skills[data.id]
            })
            SkillEditDialog.render(true)
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'cancel'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}-sheet`],
    }
  ).render(true)
}

export const _onDeleteBonus = async function (event, actor, data, SkillEditDialog) {
  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus
  const bonusPath = header.dataset.bonusPath

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Define the existing list of bonuses
  const bonusKeys = bonusPath.split('.')
  let actorBonuses = bonusKeys.reduce((obj, key) => obj && obj[key], actor.system) || []

  // Remove the bonus from the list
  actorBonuses.splice(key, 1)

  // Update the actor
  actor.update({ [`system.${bonusPath}`]: actorBonuses })

  // Re-render the skill edit dialog
  SkillEditDialog.data.content = await renderTemplate('systems/vtm5e/templates/actor/parts/skill-dialog.hbs', {
    id: data.id,
    actor,
    system,
    skill: actor.system.skills[data.id]
  })
  SkillEditDialog.render(true)
}

export const _onEditBonus = async function (event, actor, data, SkillEditDialog) {
  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus
  const bonusPath = header.dataset.bonusPath

  // Secondary variables
  const bonusData = {
    actor,
    bonus: data.skill.bonuses[key]
  }

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Render the template
  const bonusTemplate = 'systems/vtm5e/templates/item/parts/bonus-display.hbs'
  const bonusContent = await renderTemplate(bonusTemplate, bonusData)

  new Dialog(
    {
      title: bonusData.bonus.source,
      content: bonusContent,
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("WOD5E.Save"),
          callback: async html => {
            let source, value, displayWhenInactive, rawPaths, arrPaths, cleanPaths
            let paths = []
            let activeWhen = {}

            source = html.find("[id=bonusSource]").val()
            value = html.find("[id=bonusValue]").val()
            displayWhenInactive = html.find("[id=displayBonusWhenInactive]").is(':checked')

            rawPaths = html.find("[id=bonusPaths]").val()
            arrPaths = rawPaths.split(";")
            cleanPaths = arrPaths.map(function(item) {
              return item.trim()
            })
            paths = cleanPaths.filter(function(item) {
              return item !== ""
            })

            activeWhen['check'] = html.find("[id=activeWhenCheck]").val()
            activeWhen['path'] = html.find("[id=activeWhenPath]").val()
            activeWhen['value'] = html.find("[id=activeWhenValue]").val()

            // Define the existing list of bonuses
            const bonusKeys = bonusPath.split('.')
            let actorBonuses = bonusKeys.reduce((obj, key) => obj && obj[key], actor.system) || []

            // Update the existing bonus with the new data
            actorBonuses[key] = {
              source,
              value,
              paths,
              displayWhenInactive,
              activeWhen
            }

            // Update the actor
            actor.update({ [`system.${bonusPath}`]: actorBonuses })

            // Re-render the skill edit dialog
            SkillEditDialog.data.content = await renderTemplate('systems/vtm5e/templates/actor/parts/skill-dialog.hbs', {
              id: data.id,
              actor,
              system,
              skill: actor.system.skills[data.id]
            })
            SkillEditDialog.render(true)
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'cancel'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}-sheet`],
    }
  ).render(true)
}