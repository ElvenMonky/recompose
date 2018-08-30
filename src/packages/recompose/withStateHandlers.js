import { createFactory, Component } from 'react'
import setDisplayName from './setDisplayName'
import wrapDisplayName from './wrapDisplayName'
import mapValues from './utils/mapValues'

const withStateHandlers = (initialState, stateUpdaters, stateHandlers) => BaseComponent => {
  const factory = createFactory(BaseComponent)

  class WithStateHandlers extends Component {
    state = typeof initialState === 'function'
      ? initialState(this.props)
      : initialState

    stateUpdaters = mapValues(
      stateUpdaters,
      handler => (mayBeEvent, ...args) => {
        // Having that functional form of setState can be called async
        // we need to persist SyntheticEvent
        if (mayBeEvent && typeof mayBeEvent.persist === 'function') {
          mayBeEvent.persist()
        }

        this.setState((state, props) =>
          handler(state, props)(mayBeEvent, ...args)
        )
      }
    )

    stateHandlers = mapValues(
      stateHandlers,
      handler => (...args) => {
        this.setState(handler(...args));
      }
    )

    render() {
      return factory({
        ...this.props,
        ...this.state,
        ...this.stateUpdaters,
        ...this.stateHandlers,
      })
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(wrapDisplayName(BaseComponent, 'withStateHandlers'))(
      WithStateHandlers
    )
  }
  return WithStateHandlers
}

export default withStateHandlers
