// @flow
import { getWalletDBHeight, getAPIEndpoint } from 'neon-js'
import axios from 'axios'
import { version } from '../../package.json'
import { showWarningNotification } from './notification'
import { NETWORK, EXPLORER, NEON_WALLET_RELEASE_LINK } from '../core/constants'
import { openExternal } from '../core/electron'
import { FIVE_MINUTES_MS } from '../core/time'

// Constants
export const SET_HEIGHT = 'SET_HEIGHT'
export const SET_NETWORK = 'SET_NETWORK'
export const SET_EXPLORER = 'SET_EXPLORER'

// Actions
export function setNetwork (net: NetworkType) {
  const network = net === NETWORK.MAIN ? NETWORK.MAIN : NETWORK.TEST
  return {
    type: SET_NETWORK,
    payload: { network }
  }
}

export function setBlockHeight (blockHeight: number) {
  return {
    type: SET_HEIGHT,
    payload: { blockHeight }
  }
}

export function setBlockExplorer (blockExplorer: ExplorerType) {
  return {
    type: SET_EXPLORER,
    payload: { blockExplorer }
  }
}

export const checkVersion = () => (dispatch: DispatchType, getState: GetStateType) => {
  const state = getState().metadata
  const { net } = state
  const apiEndpoint = getAPIEndpoint(net)

  return axios.get(`${apiEndpoint}/v2/version`).then((res) => {
    const shouldUpdate = res && res.data && res.data.version !== version && res.data.version !== '0.0.5'
    if (shouldUpdate) {
      dispatch(showWarningNotification({
        message: `Your wallet is out of date! Please download the latest version from ${NEON_WALLET_RELEASE_LINK}`,
        dismissAfter: FIVE_MINUTES_MS,
        onClick: () => openExternal(NEON_WALLET_RELEASE_LINK)
      }))
    }
  }).catch((e) => {})
}

export const syncBlockHeight = (net: NetworkType) => (dispatch: DispatchType) => {
  getWalletDBHeight(net).then((blockHeight) => {
    return dispatch(setBlockHeight(blockHeight))
  })
}

// state getters
export const getBlockHeight = (state) => state.metadata.blockHeight
export const getNetwork = (state) => state.metadata.network
export const getBlockExplorer = (state) => state.metadata.blockExplorer

const initialState = {
  blockHeight: 0,
  network: NETWORK.MAIN,
  blockExplorer: EXPLORER.NEO_TRACKER
}

export default (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case SET_HEIGHT:
      const { blockHeight } = action.payload
      return {
        ...state,
        blockHeight
      }
    case SET_EXPLORER:
      const { blockExplorer } = action.payload
      return {
        ...state,
        blockExplorer
      }
    case SET_NETWORK:
      const { network } = action.payload
      return {
        ...state,
        network
      }
    default:
      return state
  }
}
