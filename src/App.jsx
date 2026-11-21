import { useEffect, useState } from 'react'
import { playForToast } from './game/sound'
import { useGame } from './game/useGame'
import { getFaction } from './data/factions'
import { markRead, collectionReady, claimableCount } from './game/engine'
import { COLLECTIONS } from './data/content'
import { ASSET_MAP } from './assetMap'
import FactionSelect from './components/FactionSelect'
import UpdateBanner from './components/UpdateBanner'
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
import MissionsTab from './components/tabs/MissionsTab'
import PerksTab from './components/tabs/PerksTab'

const TAB_VIEWS = { family: FamilyTab, jobs: JobsTab, realestate: RealEstateTab, arsenal: ArsenalTab, fight: FightClubTab, vault: VaultTab, missions: MissionsTab, perks: PerksTab }

export default function App() {
  const { state: s, derived: d, run, start, reset, restore } = useGame()
  const [tab, setTab] = useState('jobs')
  const [modal, setModal] = useState(null)
  useEffect(() => { playForToast(s?.toast) }, [s?.toast?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) return <><UpdateBanner /><FactionSelect onStart={(name, id) => { start(name, id); setTab('jobs') }} onRestore={restore} /></>

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
    missions: claimableCount(s),
    fight: s.world && !s.world.defeated && !s.world.escaped ? 1 : 0,
  }

  return (
    <div className="min-h-full pb-10" style={{
      '--accent': f.accent, '--deep': f.deep,
      ...(ASSET_MAP.pageBackgrounds[s.factionId] && {
        backgroundImage: `linear-gradient(rgba(10,11,13,.82), rgba(10,11,13,.9)), url(${ASSET_MAP.pageBackgrounds[s.factionId]})`,
        backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center',
      }),
    }}>
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
      <SettingsModal open={modal === 'settings'} onClose={close} s={s} onReset={() => { close(); reset() }} onRestore={(code) => { restore(code); close() }} />
      <Toast toast={s.toast} />
      <UpdateBanner />
    </div>
  )
}
