import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  // DNAs and Owners of Kitties'
  const [DNAs, setDNAs] = useState([])
  const [Owners, setOwners] = useState([])

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  
  const fetchKitties = () => {
    let unsubscribe
    api.query.kittiesModule.kittiesCount(cnt => {
      if (cnt !== '') {
        // The amounts of all kitties.
        const kittyIds = Array.from(Array(parseInt(cnt, 10)), (v, k) => k)
        // The owners of all kitties.
        api.query.kittiesModule.owner.multi(kittyIds, Owners => {
          setOwners(Owners)
        }).catch(console.error)
        // The DNAs of all kitties.
        api.query.kittiesModule.kitties.multi(kittyIds, kittyDna => {
          setDNAs(kittyDna)
        }).catch(console.error)
      }
    }).then(unsub => {
      unsubscribe = unsub
    }).catch(console.error)
    return () => unsubscribe && unsubscribe()
  }

  const populateKitties = () => {
    const kitties = []
    for (let i = 0; i < DNAs.length; ++i) {
      const kitty = {}
      kitty.id = i
      kitty.dna = DNAs[i].unwrap()
      kitty.owner = keyring.encodeAddress(Owners[i].unwrap())
      kitties[i] = kitty
    }
    setKitties(kitties)
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
