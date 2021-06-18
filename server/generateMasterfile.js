/* eslint-disable no-restricted-syntax */
const Fetch = require('node-fetch')
const Fs = require('fs-extra')
const defaultRarity = require('./src/data/defaultRarity.json')
const weatherTypes = require('./src/data/weatherTypes.json')
const { rarity: adminRarity } = require('./src/services/config')

function fetchJson(url) {
  return new Promise(resolve => {
    Fetch(url)
      .then(res => res.json())
      .then(json => resolve(json))
  })
}

((async function generate() {
  try {
    const masterfile = await fetchJson('https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json')
    const invasions = await fetchJson('https://raw.githubusercontent.com/WatWowMap/MapJS/master/static/data/grunttypes.json')
    const pogoInfo = await fetchJson('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json')

    const newInvasions = {}
    Object.entries(invasions).forEach(gruntType => {
      const [type, info] = gruntType
      const latest = pogoInfo ? pogoInfo[type] : {}

      newInvasions[type] = {
        type: invasions[type].type,
        grunt: invasions[type].grunt,
        second_reward: false,
        encounters: {},
      }
      if (info.encounters) {
        Object.keys(info.encounters).forEach((position, i) => {
          if (latest && latest.active) {
            newInvasions[type].encounters[position] = latest.lineup.team[i].map(pkmn => pkmn.id)
            newInvasions[type].second_reward = latest.lineup.rewards.length > 1
          } else {
            newInvasions[type].encounters[position] = info.encounters[position]
          }
        })
      }
    })

    const newMasterfile = {
      pokemon: {},
      moves: {},
      questTypes: masterfile.quest_types,
      questRewardTypes: masterfile.quest_reward_types,
      items: masterfile.items,
      weatherTypes,
      invasions: newInvasions,
    }

    for (const [id, move] of Object.entries(masterfile.moves)) {
      if (move.proto) {
        newMasterfile.moves[id] = masterfile.moves[id]
      }
    }

    const filterForms = (forms) => {
      const formKeys = Object.keys(forms)
      const returnedForms = {}
      for (let j = 0; j < formKeys.length; j += 1) {
        const formId = formKeys[j]
        const formName = forms[formId].name || ''
        if (!['shadow', 'purified'].includes(formName.toLowerCase())) {
          returnedForms[formId] = forms[formId]
        }
      }
      return returnedForms
    }

    const getRarityLevel = (id, pkmn) => {
      let rarity
      for (const [tier, pokemon] of Object.entries(defaultRarity)) {
        if (adminRarity[tier].length > 0) {
          if (adminRarity[tier].includes((parseInt(id)))) {
            rarity = tier
          }
        } else if (pokemon.includes(parseInt(id))) {
          rarity = tier
        }
      }
      if (pkmn.legendary) rarity = 'legendary'
      if (pkmn.mythic) rarity = 'mythical'
      return rarity
    }

    const getMovesTypes = (moves) => {
      const returnedMoves = {}
      if (moves) {
        moves.forEach(move => {
          for (const [id, moveInfo] of Object.entries(newMasterfile.moves)) {
            if (move === moveInfo.name) {
              returnedMoves[id] = {
                name: moveInfo.name,
                type: moveInfo.type,
              }
            }
          }
        })
      }
      return returnedMoves
    }

    for (const [i, pkmn] of Object.entries(masterfile.pokemon)) {
      if (pkmn.pokedex_id) {
        newMasterfile.pokemon[i] = {
          name: pkmn.name,
          forms: filterForms(pkmn.forms),
          default_form_id: pkmn.default_form_id || 0,
          pokedex_id: pkmn.pokedex_id,
          genId: pkmn.genId,
          generation: pkmn.generation,
          types: pkmn.types,
          attack: pkmn.attack,
          defense: pkmn.defense,
          stamina: pkmn.stamina,
          height: pkmn.height,
          weight: pkmn.weight,
          quick_moves: getMovesTypes(pkmn.quick_moves),
          charge_moves: getMovesTypes(pkmn.charged_moves),
          rarity: getRarityLevel(i, pkmn),
          evolutions: pkmn.evolutions,
          temp_evolutions: pkmn.temp_evolutions,
          family: pkmn.family,
        }
      }
    }
    Fs.writeJSONSync('./server/src/data/masterfile.json', newMasterfile, {
      spaces: '\t',
      EOL: '\n',
    })
  } catch (e) {
    console.warn(e, '\nUnable to generate new masterfile, using existing.')
  }
})())
