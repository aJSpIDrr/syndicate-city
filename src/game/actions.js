// Every game action a player can send. The browser looks up an action's name here; the online
// server only runs actions listed here (dev ones only when DEV_TOOLS=1).
import * as E from './engine.js'
import * as C from './clan.js'
import * as Q from './hq.js'

export const ACTIONS = {
  doJob: E.doJob, doJobRepeat: E.doJobRepeat, hireCrew: E.hireCrew, spendSkill: E.spendSkill,
  deposit: E.deposit, withdraw: E.withdraw, buyProperty: E.buyProperty, collectIncome: E.collectIncome,
  buyItem: E.buyItem, sellItem: E.sellItem, upgradeSignature: E.upgradeSignature, healAtDoctor: E.healAtDoctor,
  goldRefill: E.goldRefill, openCrate: E.openCrate, vaultCollection: E.vaultCollection, refreshRivals: E.refreshRivals,
  attackRival: E.attackRival, attackBoss: E.attackBoss, attackWorld: E.attackWorld, claimDaily: E.claimDaily,
  claimAchievement: E.claimAchievement, claimOrder: E.claimOrder, buyExclusive: E.buyExclusive, buyPerk: E.buyPerk,
  activateBoost: E.activateBoost, dismissPromotion: E.dismissPromotion, markRead: E.markRead,
  foundClan: C.foundClan, donate: C.donate, hireRecruit: C.hireRecruit, dismissMember: C.dismissMember,
  giftMember: C.giftMember, assignRole: C.assignRole, rerollRecruits: C.rerollRecruits, buyClanUpgrade: C.buyClanUpgrade,
  pushTurf: C.pushTurf, declareWar: C.declareWar, claimWar: C.claimWar, startHeist: C.startHeist,
  collectHeist: C.collectHeist, claimContract: C.claimContract,
  upgradeHq: Q.upgradeHq, buildRoom: Q.buildRoom, equipHqGear: Q.equipHqGear, unequipHqGear: Q.unequipHqGear,
  collectSafe: Q.collectSafe, refreshRivalHqs: Q.refreshRivalHqs, raidHq: Q.raidHq, attackZone: Q.attackZone,
  fortifyZone: Q.fortifyZone, collectTurf: Q.collectTurf,
}
export const DEV_ACTIONS = { devLevels: E.devLevels, devGold: E.devGold, devCash: E.devCash }

const NAMES = new Map([...Object.entries(ACTIONS), ...Object.entries(DEV_ACTIONS)].map(([k, v]) => [v, k]))
export const actionName = (fn) => NAMES.get(fn)

/** Arguments may only be small plain values (ids, numbers, short strings, arrays of ids, a crest). */
export function cleanArgs(args) {
  if (!Array.isArray(args) || args.length > 4) return null
  const ok = (v, depth = 0) => {
    if (v === null || typeof v === 'number' && Number.isFinite(v) || typeof v === 'boolean') return true
    if (typeof v === 'string') return v.length <= 64
    if (depth > 0) return false
    if (Array.isArray(v)) return v.length <= 10 && v.every((x) => ok(x, 1))
    if (typeof v === 'object') return Object.keys(v).length <= 6 && Object.values(v).every((x) => ok(x, 1))
    return false
  }
  return args.every((a) => ok(a)) ? args : null
}
