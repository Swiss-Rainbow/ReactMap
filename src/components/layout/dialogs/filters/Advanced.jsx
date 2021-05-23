import React, { useState } from 'react'
import {
  Grid,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
} from '@material-ui/core'
import { Save, Replay, Clear } from '@material-ui/icons'

import { useStore, useStatic } from '@hooks/useStore'
import StringFilter from './StringFilter'
import SliderTile from './SliderTile'
import Size from './Size'

export default function AdvancedFilter({ toggleAdvMenu, advancedFilter, type }) {
  const isMobile = useStatic(state => state.breakpoint) === 'xs'
  const { menus, text } = useStatic(state => state.ui)
  const [filterValues, setFilterValues] = useState(advancedFilter.tempFilters)
  const filters = useStore(state => state.filters)
  const setFilters = useStore(state => state.setFilters)

  const handleChange = (event, values) => {
    if (typeof event === 'object') {
      const { name, value } = event.target
      setFilterValues({ ...filterValues, [name]: value })
    } else if (event === 'default') {
      setFilterValues({ ...values, enabled: filterValues.enabled })
    } else {
      setFilterValues({ ...filterValues, [event]: values })
    }
  }

  const handleLegacySwitch = () => {
    setFilters({ ...filters, [type]: { ...filters[type], legacy: !filters[type].legacy } })
  }

  const reset = {
    key: 'reset',
    icon: (
      <IconButton
        onClick={() => handleChange('default', advancedFilter.standard)}
      >
        <Replay color="primary" />
      </IconButton>
    ),
    text: (
      <Button onClick={() => handleChange('default', advancedFilter.standard)}>
        <Typography variant="caption" color="primary">
          {text.reset}
        </Typography>
      </Button>
    ),
  }
  const save = {
    key: 'save',
    icon: (
      <IconButton
        onClick={toggleAdvMenu(false, advancedFilter.id, filterValues)}
      >
        <Save color="secondary" />
      </IconButton>
    ),
    text: (
      <Button onClick={toggleAdvMenu(false, advancedFilter.id, filterValues)}>
        <Typography color="secondary" variant="caption">
          {text.save}
        </Typography>
      </Button>
    ),
  }

  return (
    <>
      <DialogTitle style={{ color: 'white' }}>
        <Grid
          container
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={type === 'pokemon' ? 5 : 10}>
            {type === 'pokemon' ? text.advanced : text.setSize}
          </Grid>
          {type === 'pokemon' && (
            <Grid item xs={5}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={filters[type].legacy}
                    onChange={handleLegacySwitch}
                    name="adv"
                    color="secondary"
                    disabled={!menus[type].legacy}
                  />
                )}
                label={text.legacy}
              />
            </Grid>
          )}
          <Grid item xs={2} style={{ textAlign: 'right' }}>
            <IconButton onClick={toggleAdvMenu(false, type, filters.filter)}>
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      {type === 'pokemon' && (
        <DialogContent style={{ color: 'white' }}>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            {(filters[type].legacy && menus[type].legacy)
              ? (
                <Grid item xs={12}>
                  <StringFilter
                    filterValues={filterValues}
                    setFilterValues={setFilterValues}
                  />
                </Grid>
              )
              : (
                <>
                  {Object.entries(menus[type].sliders).map(category => (
                    <Grid item xs={12} sm={6} key={category[0]}>
                      {category[1].map(each => (
                        <SliderTile
                          key={each.name}
                          filterSlide={each}
                          handleChange={handleChange}
                          filterValues={filterValues}
                        />
                      ))}
                    </Grid>
                  ))}
                </>
              )}
          </Grid>
        </DialogContent>
      )}
      <DialogActions>
        <Grid
          container
          justify="center"
          alignItems="center"
        >
          <Grid item xs={type === 'pokemon' ? 8 : 7}>
            <Size
              filterValues={filterValues}
              handleChange={handleChange}
              btnSize={type === 'pokemon' ? 'medium' : 'small'}
            />
          </Grid>
          {[reset, save].map(button => (
            <Grid item xs={2} key={button.key}>
              {isMobile ? button.icon : button.text}
            </Grid>
          ))}
        </Grid>
      </DialogActions>
    </>
  )
}