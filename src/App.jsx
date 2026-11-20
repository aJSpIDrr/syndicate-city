import { useState } from 'react'
import { useGame } from './game/useGame'
import { getFaction } from './data/factions'
import { markRead, collectionReady } from './game/engine'
import { COLLECTIONS } from './data/content'
import FactionSelect from './components/FactionSelect'
import Header from './components/Header'
import { TABS } from './components/tabs.js'
import { Toast } from './components/ui'
import { PromotionModal, StoreModal, BankModal, LogModal, SettingsModal, DoctorModal } from './components/Modals'
import FamilyTab from './components/tabs/FamilyTab'
import JobsTab from './components/tabs/JobsTab'
import RealEstateTab from './components/tabs/RealEstateTab'
import ArsenalTab from './components/tabs/ArsenalTab'
import FightClubTab from './components/tabs/FightClubTab'
import VaultTab from './components/tabs/VaultTab'

const TAB_VIEWS = { family: FamilyTab, jobs: JobsTab, realestate: RealEstateTab, arsenal: ArsenalTab, fight: FightClubTab, vault: VaultTab }

export default function App() {
  const { state: s, derived: d, run, start, reset } = useGame()
  const [tab, setTab] = useState('jobs')
  const [modal, setModal] = useState(null)

  if (!s) return <FactionSelect onStart={(name, id) => { start(name, id); setTab('jobs') }} />

  const f = getFaction(s.factionId)
  const View = TAB_VIEWS[tab]
  const open = (m) => {
    if (TAB_VIEWS[m]) { setTab(m); return }
    if (m === 'log') run(markRead)
    setModal(m)
  }
  const close = () => setModal(null)
  const badges = {
    family: s.skillPoints,
    realestate: s.pendingIncome >= 1 && d.grossIncome > 0 && s.pendingIncome >= d.grossIncome * 0.5 ? 1 : 0,
    vault: COLLECTIONS.filter((c) => collectionReady(s, c)).length,
  }

  return (
    <div className="min-h-full pb-10" style={{ '--accent': f.accent, '--deep': f.deep }}>
      <Header s={s} d={d} tab={tab} setTab={setTab} onOpen={open} badges={badges} />
      <main className="mx-auto max-w-[1000px] px-2 pt-3 sm:px-3">
        <h1 className="mb-2 font-display text-xl font-bold uppercase tracking-wider text-stone-100">{TABS.find((t) => t.id === tab).label}</h1>
        <View s={s} d={d} run={run} />
      </main>

      <PromotionModal s={s} run={run} />
      <StoreModal open={modal === 'store'} onClose={close} s={s} run={run} />
      <BankModal open={modal === 'bank'} onClose={close} s={s} d={d} run={run} />
      <DoctorModal open={modal === 'doctor'} onClose={close} s={s} d={d} run={run} />
      <LogModal open={modal === 'log'} onClose={close} s={s} />
      <SettingsModal open={modal === 'settings'} onClose={close} s={s} onReset={() => { close(); reset() }} />
      <Toast toast={s.toast} />
    </div>
  )
}
