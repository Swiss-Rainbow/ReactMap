/* eslint-disable camelcase */
import React, { memo } from 'react'
import { Marker, Popup } from 'react-leaflet'

import gymMarker from '../markers/gym'
import PopupContent from '../popups/Gym'
import Timer from './Timer'

const GymTile = ({
  item, ts, showTimer, iconSizes, filters, path, availableForms,
}) => {
  const { raid_battle_timestamp, raid_end_timestamp, raid_level } = item
  const hasRaid = (raid_end_timestamp >= ts && raid_level > 0)
  const timerToDisplay = raid_battle_timestamp >= ts
    ? raid_battle_timestamp : raid_end_timestamp

  return (
    <Marker
      position={[item.lat, item.lon]}
      icon={gymMarker(item, ts, hasRaid, iconSizes, filters, path, availableForms)}
    >
      <Popup position={[item.lat, item.lon]}>
        <PopupContent gym={item} hasRaid={hasRaid} ts={ts} />
      </Popup>
      {showTimer && <Timer timestamp={timerToDisplay} />}
    </Marker>
  )
}

const areEqual = (prev, next) => {
  const raidLogic = () => {
    if (prev.item.raid_battle_timestamp <= next.ts
      && prev.item.raid_battle_timestamp > prev.ts) {
      return false
    }
    if (prev.item.raid_end_timestamp <= next.ts
      && prev.item.raid_end_timestamp > prev.ts) {
      return false
    }
    return true
  }

  const sizeLogic = () => {
    let filterId = `g${prev.item.team_id}-${6 - prev.item.availble_slots}`
    if (prev.item.team_id == 0) {
      filterId = `t${prev.item.team_id}-0`
    }
    let firstCheck = true
    if (prev.team_id) {
      firstCheck = prev.filters.filter[filterId].size === next.filters.filter[filterId].size
    }
    if (prev.item.raid_end_timestamp >= prev.ts && next.item.raid_end_timestamp >= next.ts) {
      if (prev.item.raid_pokemon_id > 0 && next.item.raid_pokemon_id > 0) {
        return firstCheck && prev.filters.filter[`${prev.item.raid_pokemon_id}-${prev.item.raid_pokemon_form}`].size === next.filters.filter[`${next.item.raid_pokemon_id}-${next.item.raid_pokemon_form}`].size
      }
      return firstCheck && prev.filters.filter[`e${prev.item.raid_level}`].size === next.filters.filter[`e${next.item.raid_level}`].size
    }
    return firstCheck
  }
  return (
    prev.item.id === next.item.id
    && prev.item.updated === next.item.updated
    && prev.item.raid_pokemon_id === next.item.raid_pokemon_id
    && raidLogic()
    && sizeLogic()
    && prev.showTimer === next.showTimer
    && prev.item.team_id === next.item.team_id
  )
}

export default memo(GymTile, areEqual)