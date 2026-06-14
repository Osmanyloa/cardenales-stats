import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function formatStat(value) {
  if (value === null || value === undefined) return '.000'
  const num = Number(value)
  if (Number.isNaN(num)) return '.000'
  if (num >= 1) return num.toFixed(3)
  return num.toFixed(3).replace('0.', '.')
}

function formatDecimal2(value) {
  if (value === null || value === undefined) return '0.00'
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function formatDate(value) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'EH']

const ADMIN_EMAIL = 'osmanyloa@gmail.com'

const emptyLine = {
  player_id: '',
  ab: 0,
  r: 0,
  h: 0,
  doubles: 0,
  triples: 0,
  hr: 0,
  rbi: 0,
  bb: 0,
  hbp: 0,
  sf: 0,
  so: 0,
  sb: 0,
}


const emptyPitchLine = {
  player_id: '',
  ip: '',
  h: 0,
  ab_against: 0,
  er: 0,
  uer: 0,
  bb: 0,
  so: 0,
  hr: 0,
  hbp: 0,
  pitches: 0,
  balls: 0,
  strikes: 0,
  w: 0,
  l: 0,
  sv: 0,
}

const emptyPlayerReport = {
  game_date: '',
  opponent: '',
  game_label: 'Game 1',
  player_id: '',
  notes: '',

  bat_ab: 0,
  bat_r: 0,
  bat_h: 0,
  bat_doubles: 0,
  bat_triples: 0,
  bat_hr: 0,
  bat_rbi: 0,
  bat_bb: 0,
  bat_hbp: 0,
  bat_sf: 0,
  bat_so: 0,
  bat_sb: 0,

  pit_ip: '',
  pit_h: 0,
  pit_er: 0,
  pit_uer: 0,
  pit_bb: 0,
  pit_so: 0,
  pit_hr: 0,
  pit_hbp: 0,
  pit_pitches: 0,
  pit_w: 0,
  pit_l: 0,
  pit_sv: 0,
}

const emptyTeamBattingTotals = {
  ab: 0,
  r: 0,
  h: 0,
  doubles: 0,
  triples: 0,
  hr: 0,
  rbi: 0,
  bb: 0,
  hbp: 0,
  sf: 0,
  so: 0,
  sb: 0,
  avg: 0,
  obp: 0,
  slg: 0,
  ops: 0,
}

const emptyTeamPitchingTotals = {
  ip: '0.0',
  ip_outs: 0,
  h: 0,
  ab_against: 0,
  er: 0,
  uer: 0,
  bb: 0,
  so: 0,
  hr: 0,
  hbp: 0,
  pitches: 0,
  balls: 0,
  strikes: 0,
  w: 0,
  l: 0,
  sv: 0,
  era: 0,
  whip: 0,
  baa: 0,
  k_bb: 0,
  k9: 0,
  bb9: 0,
  strike_pct: 0,
}

function formatPercent(value) {
  if (value === null || value === undefined) return '0.0%'
  const num = Number(value)
  if (Number.isNaN(num)) return '0.0%'
  return `${num.toFixed(1)}%`
}

function parseIpToOuts(value) {
  if (value === null || value === undefined || value === '') return 0

  const clean = String(value).trim()
  if (!clean) return 0

  const parts = clean.split('.')
  const innings = Number(parts[0] || 0)
  const extraOuts = parts.length > 1 ? Number(parts[1] || 0) : 0

  if (Number.isNaN(innings) || Number.isNaN(extraOuts)) return 0
  if (extraOuts < 0 || extraOuts > 2) return null

  return innings * 3 + extraOuts
}

function formatIpFromOuts(outs) {
  const totalOuts = Number(outs || 0)
  const innings = Math.floor(totalOuts / 3)
  const extraOuts = totalOuts % 3
  return `${innings}.${extraOuts}`
}

const playMap = {
  single: {
    label: 'Single',
    ab: 1,
    h: 1,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: true,
    isAtBat: true,
    outs: 0,
    hitAdd: 1,
    advanceBatter: true,
  },
  double: {
    label: 'Double',
    ab: 1,
    h: 1,
    doubles: 1,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: true,
    isAtBat: true,
    outs: 0,
    hitAdd: 1,
    advanceBatter: true,
  },
  triple: {
    label: 'Triple',
    ab: 1,
    h: 1,
    doubles: 0,
    triples: 1,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: true,
    isAtBat: true,
    outs: 0,
    hitAdd: 1,
    advanceBatter: true,
  },
  homerun: {
    label: 'Home Run',
    ab: 1,
    h: 1,
    doubles: 0,
    triples: 0,
    hr: 1,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: true,
    isAtBat: true,
    outs: 0,
    hitAdd: 1,
    advanceBatter: true,
  },
  walk: {
    label: 'Walk',
    ab: 0,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 1,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: false,
    isAtBat: false,
    outs: 0,
    hitAdd: 0,
    advanceBatter: true,
  },
  hbp: {
    label: 'HBP',
    ab: 0,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 1,
    so: 0,
    sb: 0,
    isHit: false,
    isAtBat: false,
    outs: 0,
    hitAdd: 0,
    advanceBatter: true,
  },
  strikeout: {
    label: 'Strikeout',
    ab: 1,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 1,
    sb: 0,
    isHit: false,
    isAtBat: true,
    outs: 1,
    hitAdd: 0,
    advanceBatter: true,
  },
  out: {
    label: 'Out',
    ab: 1,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: false,
    isAtBat: true,
    outs: 1,
    hitAdd: 0,
    advanceBatter: true,
  },
  doubleplay: {
    label: 'Double Play',
    ab: 1,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 0,
    isHit: false,
    isAtBat: true,
    outs: 2,
    hitAdd: 0,
    advanceBatter: true,
  },
  stolenbase: {
    label: 'Stolen Base',
    ab: 0,
    h: 0,
    doubles: 0,
    triples: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    sb: 1,
    isHit: false,
    isAtBat: false,
    outs: 0,
    hitAdd: 0,
    advanceBatter: false,
  },
}

function App() {
  const [activeTab, setActiveTab] = useState('live')

  const [session, setSession] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [players, setPlayers] = useState([])
  const [playersList, setPlayersList] = useState([])
  const [lineupRows, setLineupRows] = useState([])

  const [activeGame, setActiveGame] = useState(null)
  const [gameLineup, setGameLineup] = useState([])
  const [gameStatsLineup, setGameStatsLineup] = useState([])
  const [gameEvents, setGameEvents] = useState([])

  const [gameHistory, setGameHistory] = useState([])
  const [selectedHistoryGame, setSelectedHistoryGame] = useState(null)
  const [selectedHistoryLineup, setSelectedHistoryLineup] = useState([])
  const [selectedHistoryStatsLineup, setSelectedHistoryStatsLineup] = useState([])
  const [selectedHistoryEvents, setSelectedHistoryEvents] = useState([])
  const [selectedHistoryBattingLines, setSelectedHistoryBattingLines] = useState([])
  const [selectedHistoryPitchingLines, setSelectedHistoryPitchingLines] = useState([])
  const [historyScoreCardenales, setHistoryScoreCardenales] = useState(0)
  const [historyScoreOpponent, setHistoryScoreOpponent] = useState(0)
  const [historyScoreSaving, setHistoryScoreSaving] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [gameDate, setGameDate] = useState('')
  const [opponent, setOpponent] = useState('')
  const [line, setLine] = useState(emptyLine)

  const [pitchingPlayers, setPitchingPlayers] = useState([])
  const [teamBattingTotals, setTeamBattingTotals] = useState(emptyTeamBattingTotals)
  const [teamPitchingTotals, setTeamPitchingTotals] = useState(emptyTeamPitchingTotals)

  const [pitchGameDate, setPitchGameDate] = useState('')
  const [pitchOpponent, setPitchOpponent] = useState('')
  const [pitchLine, setPitchLine] = useState(emptyPitchLine)

  const [liveDate, setLiveDate] = useState('')
  const [liveTime, setLiveTime] = useState('')
  const [liveOpponent, setLiveOpponent] = useState('')
  const [cardenalesSide, setCardenalesSide] = useState('home')
  const [currentBatterIndex, setCurrentBatterIndex] = useState(0)

  const [runsScored, setRunsScored] = useState(0)
  const [rbi, setRbi] = useState(0)

  const [opponentRunsInput, setOpponentRunsInput] = useState(0)
  const [opponentHitsInput, setOpponentHitsInput] = useState(0)
  const [opponentErrorsInput, setOpponentErrorsInput] = useState(0)

  const [subPlayerOut, setSubPlayerOut] = useState('')
  const [subPlayerIn, setSubPlayerIn] = useState('')
  const [subPosition, setSubPosition] = useState('')

  const [playerReport, setPlayerReport] = useState(emptyPlayerReport)
  const [reportSaving, setReportSaving] = useState(false)
  const [pendingReports, setPendingReports] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  useEffect(() => {
    loadAll()
    initAuth()

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadPendingReports()
    } else {
      setPendingReports([])
    }
  }, [isAdmin])

  async function initAuth() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error checking auth session:', error)
      return
    }

    setSession(data.session || null)
  }

  async function signInAdmin(event) {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    })

    if (error) {
      console.error('Login error:', error)
      setAuthError('Wrong email or password')
      setAuthLoading(false)
      return
    }

    setSession(data.session || null)
    setLoginEmail('')
    setLoginPassword('')
    setAuthLoading(false)

    if (data.session?.user?.email === ADMIN_EMAIL) {
      setActiveTab('live')
    }

    await loadAll()
  }

  async function signOutAdmin() {
    await supabase.auth.signOut()
    setSession(null)
    setActiveTab('live')
  }

  function requireAdmin() {
    if (!isAdmin) {
      alert('Admin access required')
      return false
    }

    return true
  }

  async function loadAll() {
    const roster = await loadPlayers()
    await loadStats()
    await loadActiveGame(roster)
    await loadGameHistory()
  }

  async function loadStats() {
    setLoading(true)

    const [battingResponse, pitchingResponse, teamBattingResponse, teamPitchingResponse] = await Promise.all([
      supabase
        .from('batting_totals')
        .select('*')
        .order('avg', { ascending: false }),

      supabase
        .from('pitching_totals')
        .select('*')
        .order('era', { ascending: true }),

      supabase
        .from('team_batting_totals')
        .select('*')
        .maybeSingle(),

      supabase
        .from('team_pitching_totals')
        .select('*')
        .maybeSingle(),
    ])

    if (battingResponse.error) {
      console.error('Error loading batting stats:', battingResponse.error)
    } else {
      setPlayers(battingResponse.data || [])
    }

    if (pitchingResponse.error) {
      console.error('Error loading pitching stats:', pitchingResponse.error)
    } else {
      setPitchingPlayers(pitchingResponse.data || [])
    }

    if (teamBattingResponse.error) {
      console.error('Error loading team batting totals:', teamBattingResponse.error)
    } else {
      setTeamBattingTotals(teamBattingResponse.data || emptyTeamBattingTotals)
    }

    if (teamPitchingResponse.error) {
      console.error('Error loading team pitching totals:', teamPitchingResponse.error)
    } else {
      setTeamPitchingTotals(teamPitchingResponse.data || emptyTeamPitchingTotals)
    }

    setLoading(false)
  }

  async function loadPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, number')
      .eq('active', true)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error loading players:', error)
      return []
    }

    setPlayersList(data || [])

    setLineupRows(
      (data || []).map((player, index) => ({
        player_id: player.id,
        name: player.name,
        is_starter: index < 10,
        batting_order: index < 10 ? index + 1 : '',
        field_position: index < 9 ? positions[index] : index === 9 ? 'DH' : '',
      }))
    )

    return data || []
  }

  async function loadActiveGame(roster = playersList) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error loading active game:', error)
      return
    }

    setActiveGame(data || null)

    if (data?.id) {
      setCurrentBatterIndex(Number(data.current_batter_index || 0))
      const currentLineup = await loadGameLineup(data.id, setGameLineup, true, roster)
      const fullLineup = await loadGameLineup(data.id, setGameStatsLineup, false, roster)

      if (currentLineup.length > 0) setGameLineup(currentLineup)
      if (fullLineup.length > 0) setGameStatsLineup(fullLineup)

      await loadGameEvents(data.id, setGameEvents)
    } else {
      setGameLineup([])
      setGameStatsLineup([])
      setGameEvents([])
    }
  }

  async function loadGameLineup(gameId, setter, currentOnly = true, roster = playersList) {
    const { data, error } = await supabase
      .from('game_lineups')
      .select(`
        id,
        game_id,
        player_id,
        batting_order,
        field_position,
        is_starter,
        is_current,
        replaced_player_id
      `)
      .eq('game_id', gameId)
      .order('batting_order', { ascending: true })

    if (error) {
      console.error('Error loading lineup:', error)
      return []
    }

    let rows = data || []

    if (currentOnly) {
      rows = rows.filter(row => row.is_current !== false)
    }

    const mapped = rows.map(row => {
      const playerInfo = roster.find(player => Number(player.id) === Number(row.player_id))

      return {
        ...row,
        name: playerInfo?.name || `Player ${row.player_id}`,
      }
    })

    if (mapped.length > 0) {
      setter(mapped)
    }

    return mapped
  }


  async function loadGameEvents(gameId, setter) {
    const { data, error } = await supabase
      .from('game_events')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading game events:', error)
      setter([])
      return []
    }

    setter(data || [])
    return data || []
  }

  async function loadHistoryOfficialLines(gameId) {
    const [battingResponse, pitchingResponse] = await Promise.all([
      supabase
        .from('batting_lines')
        .select('*, players(name, number)')
        .eq('game_id', gameId)
        .order('id', { ascending: true }),

      supabase
        .from('pitching_lines')
        .select('*, players(name, number)')
        .eq('game_id', gameId)
        .order('id', { ascending: true }),
    ])

    if (battingResponse.error) {
      console.error('Error loading official batting lines:', battingResponse.error)
      setSelectedHistoryBattingLines([])
    } else {
      setSelectedHistoryBattingLines(battingResponse.data || [])
    }

    if (pitchingResponse.error) {
      console.error('Error loading official pitching lines:', pitchingResponse.error)
      setSelectedHistoryPitchingLines([])
    } else {
      setSelectedHistoryPitchingLines(pitchingResponse.data || [])
    }
  }

  async function loadGameHistory() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .not('completed_at', 'is', null)
      .order('game_date', { ascending: false })
      .order('game_time', { ascending: false })

    if (error) {
      console.error('Error loading game history:', error)
      return
    }

    setGameHistory(data || [])
  }

  async function openHistoryGame(game) {
    setSelectedHistoryGame(game)
    setHistoryScoreCardenales(Number(game.cardenales_runs || 0))
    setHistoryScoreOpponent(Number(game.opponent_runs || 0))
    await loadGameLineup(game.id, setSelectedHistoryLineup, true, playersList)
    await loadGameLineup(game.id, setSelectedHistoryStatsLineup, false, playersList)
    await loadGameEvents(game.id, setSelectedHistoryEvents)
    await loadHistoryOfficialLines(game.id)
  }

  async function saveHistoryFinalScore(event) {
    event.preventDefault()

    if (!requireAdmin()) return
    if (!selectedHistoryGame) return

    setHistoryScoreSaving(true)

    const { data, error } = await supabase
      .from('games')
      .update({
        cardenales_runs: Number(historyScoreCardenales || 0),
        opponent_runs: Number(historyScoreOpponent || 0),
      })
      .eq('id', selectedHistoryGame.id)
      .select()
      .single()

    if (error) {
      console.error('Error saving final score:', error)
      alert('Error saving final score')
      setHistoryScoreSaving(false)
      return
    }

    setSelectedHistoryGame(data)
    setGameHistory(prev => prev.map(game => Number(game.id) === Number(data.id) ? data : game))
    setHistoryScoreSaving(false)
    alert('Final score saved')
  }

  function getCurrentBatter() {
    if (!gameLineup.length) return null
    return gameLineup[currentBatterIndex] || gameLineup[0]
  }

  function isCardenalesBatting(game) {
    if (!game) return false
    const cardenalesIsHome = game.home_team === 'Cardenales'
    return cardenalesIsHome ? game.half_inning === 'Bottom' : game.half_inning === 'Top'
  }

  function updateLineupRow(playerId, field, value) {
    setLineupRows(prev =>
      prev.map(row =>
        Number(row.player_id) === Number(playerId)
          ? { ...row, [field]: value }
          : row
      )
    )
  }

  function updateLine(field, value) {
    setLine(prev => ({
      ...prev,
      [field]: field === 'player_id' ? value : Number(value),
    }))
  }

  function getNextGameState(extraOuts) {
    if (!activeGame) return {}

    let newOuts = Number(activeGame.outs || 0) + extraOuts
    let newInning = Number(activeGame.inning || 1)
    let newHalf = activeGame.half_inning || 'Top'

    if (newOuts >= 3) {
      newOuts = 0

      if (newHalf === 'Top') {
        newHalf = 'Bottom'
      } else {
        newHalf = 'Top'
        newInning += 1
      }
    }

    return {
      outs: newOuts,
      inning: newInning,
      half_inning: newHalf,
    }
  }

  async function createLiveGame(event) {
    event.preventDefault()

    if (!requireAdmin()) return

    if (!liveDate) {
      alert('Enter the game date')
      return
    }

    if (!liveTime) {
      alert('Enter the game time')
      return
    }

    if (!liveOpponent.trim()) {
      alert('Enter the opponent name')
      return
    }

    const starters = lineupRows
      .filter(row => row.is_starter)
      .map(row => ({
        ...row,
        batting_order: Number(row.batting_order),
      }))
      .sort((a, b) => a.batting_order - b.batting_order)

    if (!starters.length) {
      alert('Select at least one starter')
      return
    }

    if (starters.some(row => !row.batting_order || !row.field_position)) {
      alert('Every starter needs batting order and position')
      return
    }

    const orders = starters.map(row => row.batting_order)
    const uniqueOrders = new Set(orders)

    if (orders.length !== uniqueOrders.size) {
      alert('Batting order cannot have duplicate numbers')
      return
    }

    const cardenalesIsHome = cardenalesSide === 'home'
    const awayTeam = cardenalesIsHome ? liveOpponent.trim() : 'Cardenales'
    const homeTeam = cardenalesIsHome ? 'Cardenales' : liveOpponent.trim()

    await supabase
      .from('games')
      .update({ is_active: false })
      .eq('is_active', true)

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        game_date: liveDate,
        game_time: liveTime,
        opponent: liveOpponent.trim(),
        away_team: awayTeam,
        home_team: homeTeam,

        opponent_i1: 0,
        opponent_i2: 0,
        opponent_i3: 0,
        opponent_i4: 0,
        opponent_i5: 0,
        opponent_i6: 0,
        opponent_i7: 0,
        opponent_i8: 0,
        opponent_i9: 0,

        cardenales_i1: 0,
        cardenales_i2: 0,
        cardenales_i3: 0,
        cardenales_i4: 0,
        cardenales_i5: 0,
        cardenales_i6: 0,
        cardenales_i7: 0,
        cardenales_i8: 0,
        cardenales_i9: 0,

        cardenales_runs: 0,
        opponent_runs: 0,
        cardenales_hits: 0,
        opponent_hits: 0,
        cardenales_errors: 0,
        opponent_errors: 0,
        inning: 1,
        half_inning: 'Top',
        outs: 0,
        current_batter_index: 0,
        is_active: true,
      })
      .select()
      .single()

    if (gameError) {
      console.error('Error creating live game:', gameError)
      alert('Error creating live game')
      return
    }

    const lineupToInsert = starters.map(row => ({
      game_id: gameData.id,
      player_id: Number(row.player_id),
      batting_order: Number(row.batting_order),
      field_position: row.field_position,
      is_starter: true,
      is_current: true,
    }))

    const { error: lineupError } = await supabase
      .from('game_lineups')
      .insert(lineupToInsert)

    if (lineupError) {
      console.error('Error saving lineup:', lineupError)
      alert('Error saving lineup')
      return
    }

    const instantLineup = starters.map(row => ({
      id: `temp-${row.player_id}`,
      game_id: gameData.id,
      player_id: Number(row.player_id),
      batting_order: Number(row.batting_order),
      field_position: row.field_position,
      is_starter: true,
      is_current: true,
      name: row.name,
    }))

    setActiveGame(gameData)
    setGameLineup(instantLineup)
    setGameStatsLineup(instantLineup)
    setGameEvents([])
    setCurrentBatterIndex(0)
    setRunsScored(0)
    setRbi(0)

    const loadedCurrentLineup = await loadGameLineup(gameData.id, setGameLineup, true, playersList)
    const loadedFullLineup = await loadGameLineup(gameData.id, setGameStatsLineup, false, playersList)

    if (loadedCurrentLineup.length > 0) setGameLineup(loadedCurrentLineup)
    if (loadedFullLineup.length > 0) setGameStatsLineup(loadedFullLineup)

    alert('Live game created')
  }

  async function endLiveGame() {
    if (!requireAdmin()) return
    if (!activeGame) return

    const { error } = await supabase
      .from('games')
      .update({
        is_active: false,
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeGame.id)

    if (error) {
      console.error('Error ending game:', error)
      alert('Error ending game')
      return
    }

    setActiveGame(null)
    setGameLineup([])
    setGameStatsLineup([])
    setGameEvents([])
    await loadGameHistory()
    alert('Game saved to history')
  }

  async function setCurrentBatter(index) {
    if (!requireAdmin()) return

    setCurrentBatterIndex(index)

    if (!activeGame) return

    await supabase
      .from('games')
      .update({ current_batter_index: index })
      .eq('id', activeGame.id)
  }

  async function recordPlay(play) {
    if (!requireAdmin()) return

    if (!activeGame) {
      alert('Create a live game first')
      return
    }

    const currentBatter = getCurrentBatter()

    if (!currentBatter) {
      alert('No batter available. End this game and create a new one with lineup.')
      return
    }

    const selectedPlay = playMap[play]
    const runs = Number(runsScored || 0)
    const rbiValue = Number(rbi || 0)

    const { error: eventError } = await supabase
      .from('game_events')
      .insert({
        game_id: activeGame.id,
        player_id: Number(currentBatter.player_id),
        inning: activeGame.inning,
        half_inning: activeGame.half_inning,
        outs_before: activeGame.outs,
        event_type: selectedPlay.label,
        rbi: rbiValue,
        runs_scored: runs,
        is_hit: selectedPlay.isHit,
        is_at_bat: selectedPlay.isAtBat,
      })

    if (eventError) {
      console.error('Error saving game event:', eventError)
      alert('Error saving game event')
      return
    }

    const nextState = getNextGameState(selectedPlay.outs)
    const inningNumber = Math.min(Number(activeGame.inning || 1), 9)
    const cardenalesInningColumn = `cardenales_i${inningNumber}`

    const nextBatterIndex = selectedPlay.advanceBatter
      ? (currentBatterIndex + 1) % gameLineup.length
      : currentBatterIndex

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        cardenales_runs: Number(activeGame.cardenales_runs || 0) + runs,
        cardenales_hits: Number(activeGame.cardenales_hits || 0) + selectedPlay.hitAdd,
        [cardenalesInningColumn]: Number(activeGame[cardenalesInningColumn] || 0) + runs,
        outs: nextState.outs,
        inning: nextState.inning,
        half_inning: nextState.half_inning,
        current_batter_index: nextBatterIndex,
      })
      .eq('id', activeGame.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating scoreboard:', updateError)
      alert('Error updating scoreboard')
      return
    }

    setActiveGame(updatedGame)
    setCurrentBatterIndex(nextBatterIndex)
    setRunsScored(0)
    setRbi(0)
    await loadGameEvents(activeGame.id, setGameEvents)
  }

  async function addOpponentStats() {
    if (!requireAdmin()) return
    if (!activeGame) return

    const runs = Number(opponentRunsInput || 0)
    const hits = Number(opponentHitsInput || 0)
    const errors = Number(opponentErrorsInput || 0)
    const inningNumber = Math.min(Number(activeGame.inning || 1), 9)
    const opponentInningColumn = `opponent_i${inningNumber}`

    const { data: updatedGame, error } = await supabase
      .from('games')
      .update({
        opponent_runs: Number(activeGame.opponent_runs || 0) + runs,
        opponent_hits: Number(activeGame.opponent_hits || 0) + hits,
        cardenales_errors: Number(activeGame.cardenales_errors || 0) + errors,
        [opponentInningColumn]: Number(activeGame[opponentInningColumn] || 0) + runs,
      })
      .eq('id', activeGame.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating opponent stats:', error)
      alert('Error updating opponent stats')
      return
    }

    setActiveGame(updatedGame)
    setOpponentRunsInput(0)
    setOpponentHitsInput(0)
    setOpponentErrorsInput(0)
  }

  async function recordOpponentOut() {
    if (!requireAdmin()) return
    if (!activeGame) return

    const nextState = getNextGameState(1)

    const { data: updatedGame, error } = await supabase
      .from('games')
      .update({
        outs: nextState.outs,
        inning: nextState.inning,
        half_inning: nextState.half_inning,
      })
      .eq('id', activeGame.id)
      .select()
      .single()

    if (error) {
      console.error('Error recording opponent out:', error)
      alert('Error recording opponent out')
      return
    }

    setActiveGame(updatedGame)
  }

  async function undoLastPlay() {
    if (!requireAdmin()) return

    if (!activeGame) {
      alert('No active game')
      return
    }

    const { data: lastEvent, error: eventError } = await supabase
      .from('game_events')
      .select('*')
      .eq('game_id', activeGame.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (eventError) {
      console.error('Error loading last play:', eventError)
      alert('Error loading last play')
      return
    }

    if (!lastEvent) {
      alert('No play to undo')
      return
    }

    const eventInfo = Object.values(playMap).find(play => play.label === lastEvent.event_type)
    const runsToRemove = Number(lastEvent.runs_scored || 0)
    const hitToRemove = lastEvent.is_hit ? 1 : 0
    const inningNumber = Math.min(Number(lastEvent.inning || 1), 9)
    const cardenalesInningColumn = `cardenales_i${inningNumber}`

    const { error: deleteEventError } = await supabase
      .from('game_events')
      .delete()
      .eq('id', lastEvent.id)

    if (deleteEventError) {
      console.error('Error deleting game event:', deleteEventError)
      alert('Error deleting game event')
      return
    }

    const restoredIndex = eventInfo?.advanceBatter
      ? Math.max(0, gameLineup.findIndex(row => Number(row.player_id) === Number(lastEvent.player_id)))
      : currentBatterIndex

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        cardenales_runs: Math.max(0, Number(activeGame.cardenales_runs || 0) - runsToRemove),
        cardenales_hits: Math.max(0, Number(activeGame.cardenales_hits || 0) - hitToRemove),
        [cardenalesInningColumn]: Math.max(0, Number(activeGame[cardenalesInningColumn] || 0) - runsToRemove),
        inning: lastEvent.inning,
        half_inning: lastEvent.half_inning,
        outs: lastEvent.outs_before,
        current_batter_index: restoredIndex,
      })
      .eq('id', activeGame.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error restoring scoreboard:', updateError)
      alert('Error restoring scoreboard')
      return
    }

    setActiveGame(updatedGame)
    setCurrentBatterIndex(restoredIndex)
    setRunsScored(0)
    setRbi(0)
    await loadGameEvents(activeGame.id, setGameEvents)
  }

  async function makeSubstitution(event) {
    event.preventDefault()

    if (!requireAdmin()) return

    if (!activeGame) {
      alert('No active game')
      return
    }

    if (!subPlayerOut || !subPlayerIn || !subPosition) {
      alert('Select player out, player in and position')
      return
    }

    if (Number(subPlayerOut) === Number(subPlayerIn)) {
      alert('Player out and player in cannot be the same')
      return
    }

    const outgoing = gameLineup.find(row => Number(row.player_id) === Number(subPlayerOut))

    if (!outgoing) {
      alert('Player out is not currently in the game')
      return
    }

    const alreadyInGame = gameLineup.some(row => Number(row.player_id) === Number(subPlayerIn))

    if (alreadyInGame) {
      alert('That player is already in the game')
      return
    }

    const { error: insertError } = await supabase
      .from('game_lineups')
      .insert({
        game_id: activeGame.id,
        player_id: Number(subPlayerIn),
        batting_order: Number(outgoing.batting_order),
        field_position: subPosition,
        is_starter: false,
        is_current: true,
        replaced_player_id: Number(subPlayerOut),
      })

    if (insertError) {
      console.error('Error inserting substitute:', insertError)
      alert('Error inserting substitute')
      return
    }

    const { error: updateError } = await supabase
      .from('game_lineups')
      .update({ is_current: false })
      .eq('id', outgoing.id)

    if (updateError) {
      console.error('Error replacing player:', updateError)
      alert('Error replacing player')
      return
    }

    await supabase
      .from('game_substitutions')
      .insert({
        game_id: activeGame.id,
        player_out_id: Number(subPlayerOut),
        player_in_id: Number(subPlayerIn),
        batting_order: Number(outgoing.batting_order),
        field_position: subPosition,
        inning: activeGame.inning,
        half_inning: activeGame.half_inning,
      })

    setSubPlayerOut('')
    setSubPlayerIn('')
    setSubPosition('')

    await loadGameLineup(activeGame.id, setGameLineup, true, playersList)
    await loadGameLineup(activeGame.id, setGameStatsLineup, false, playersList)

    alert('Substitution saved')
  }

  function updatePlayerReport(field, value) {
    setPlayerReport(prev => ({
      ...prev,
      [field]: field === 'game_date' || field === 'opponent' || field === 'game_label' || field === 'player_id' || field === 'pit_ip' || field === 'notes'
        ? value
        : Number(value),
    }))
  }

  async function submitPlayerReport(event) {
    event.preventDefault()

    if (!playerReport.game_date) {
      alert('Enter the game date')
      return
    }

    if (!playerReport.opponent.trim()) {
      alert('Enter the opponent')
      return
    }

    if (!playerReport.player_id) {
      alert('Select your name')
      return
    }

    const ipOuts = parseIpToOuts(playerReport.pit_ip)

    if (ipOuts === null) {
      alert('Pitching IP can only end in .0, .1 or .2. Example: 5.2')
      return
    }

    setReportSaving(true)

    const { error } = await supabase
      .from('player_stat_reports')
      .insert({
        game_date: playerReport.game_date,
        opponent: playerReport.opponent.trim(),
        game_label: playerReport.game_label || 'Game 1',
        player_id: Number(playerReport.player_id),
        notes: playerReport.notes || null,

        bat_ab: Number(playerReport.bat_ab || 0),
        bat_r: Number(playerReport.bat_r || 0),
        bat_h: Number(playerReport.bat_h || 0),
        bat_doubles: Number(playerReport.bat_doubles || 0),
        bat_triples: Number(playerReport.bat_triples || 0),
        bat_hr: Number(playerReport.bat_hr || 0),
        bat_rbi: Number(playerReport.bat_rbi || 0),
        bat_bb: Number(playerReport.bat_bb || 0),
        bat_hbp: Number(playerReport.bat_hbp || 0),
        bat_sf: Number(playerReport.bat_sf || 0),
        bat_so: Number(playerReport.bat_so || 0),
        bat_sb: Number(playerReport.bat_sb || 0),

        pit_ip: playerReport.pit_ip || null,
        pit_ip_outs: ipOuts || 0,
        pit_h: Number(playerReport.pit_h || 0),
        pit_er: Number(playerReport.pit_er || 0),
        pit_uer: Number(playerReport.pit_uer || 0),
        pit_bb: Number(playerReport.pit_bb || 0),
        pit_so: Number(playerReport.pit_so || 0),
        pit_hr: Number(playerReport.pit_hr || 0),
        pit_hbp: Number(playerReport.pit_hbp || 0),
        pit_pitches: Number(playerReport.pit_pitches || 0),
        pit_w: Number(playerReport.pit_w || 0),
        pit_l: Number(playerReport.pit_l || 0),
        pit_sv: Number(playerReport.pit_sv || 0),
        status: 'pending',
      })

    if (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report. Try again.')
      setReportSaving(false)
      return
    }

    const keepGameInfo = {
      game_date: playerReport.game_date,
      opponent: playerReport.opponent,
      game_label: playerReport.game_label,
    }

    setPlayerReport({
      ...emptyPlayerReport,
      ...keepGameInfo,
    })

    setReportSaving(false)
    alert('Report submitted successfully.')
  }

  async function loadPendingReports() {
    if (!isAdmin) return

    setReviewLoading(true)

    const { data, error } = await supabase
      .from('player_stat_reports')
      .select('*, players(name, number)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading pending reports:', error)
      setReviewLoading(false)
      return
    }

    setPendingReports(data || [])
    setReviewLoading(false)
  }

  function reportHasBatting(report) {
    return [
      'bat_ab',
      'bat_r',
      'bat_h',
      'bat_doubles',
      'bat_triples',
      'bat_hr',
      'bat_rbi',
      'bat_bb',
      'bat_hbp',
      'bat_sf',
      'bat_so',
      'bat_sb',
    ].some(field => Number(report[field] || 0) > 0)
  }

  function reportHasPitching(report) {
    return [
      'pit_ip_outs',
      'pit_h',
      'pit_er',
      'pit_uer',
      'pit_bb',
      'pit_so',
      'pit_hr',
      'pit_hbp',
      'pit_pitches',
      'pit_w',
      'pit_l',
      'pit_sv',
    ].some(field => Number(report[field] || 0) > 0)
  }

  async function getOrCreateReportGame(report) {
    const gameLabel = report.game_label || 'Game 1'

    const { data: existingGame, error: findError } = await supabase
      .from('games')
      .select('*')
      .eq('game_date', report.game_date)
      .eq('opponent', report.opponent)
      .eq('game_label', gameLabel)
      .limit(1)
      .maybeSingle()

    if (findError) {
      throw findError
    }

    if (existingGame) {
      if (!existingGame.completed_at) {
        const { data: updatedGame, error: updateExistingError } = await supabase
          .from('games')
          .update({
            completed_at: new Date().toISOString(),
            is_active: false,
          })
          .eq('id', existingGame.id)
          .select()
          .single()

        if (updateExistingError) {
          throw updateExistingError
        }

        return updatedGame
      }

      return existingGame
    }

    const { data: newGame, error: gameError } = await supabase
      .from('games')
      .insert({
        game_date: report.game_date,
        opponent: report.opponent,
        game_label: gameLabel,
        away_team: report.opponent,
        home_team: 'Cardenales',
        is_active: false,
        completed_at: new Date().toISOString(),
        opponent_i1: 0,
        opponent_i2: 0,
        opponent_i3: 0,
        opponent_i4: 0,
        opponent_i5: 0,
        opponent_i6: 0,
        opponent_i7: 0,
        opponent_i8: 0,
        opponent_i9: 0,
        cardenales_i1: 0,
        cardenales_i2: 0,
        cardenales_i3: 0,
        cardenales_i4: 0,
        cardenales_i5: 0,
        cardenales_i6: 0,
        cardenales_i7: 0,
        cardenales_i8: 0,
        cardenales_i9: 0,
        cardenales_runs: 0,
        opponent_runs: 0,
        cardenales_hits: 0,
        opponent_hits: 0,
        cardenales_errors: 0,
        opponent_errors: 0,
      })
      .select()
      .single()

    if (gameError) {
      throw gameError
    }

    return newGame
  }

  async function approveReport(report) {
    if (!requireAdmin()) return

    try {
      const game = await getOrCreateReportGame(report)

      if (reportHasBatting(report)) {
        const { error: battingError } = await supabase
          .from('batting_lines')
          .insert({
            game_id: game.id,
            player_id: Number(report.player_id),
            ab: Number(report.bat_ab || 0),
            r: Number(report.bat_r || 0),
            h: Number(report.bat_h || 0),
            doubles: Number(report.bat_doubles || 0),
            triples: Number(report.bat_triples || 0),
            hr: Number(report.bat_hr || 0),
            rbi: Number(report.bat_rbi || 0),
            bb: Number(report.bat_bb || 0),
            hbp: Number(report.bat_hbp || 0),
            sf: Number(report.bat_sf || 0),
            so: Number(report.bat_so || 0),
            sb: Number(report.bat_sb || 0),
          })

        if (battingError) {
          throw battingError
        }
      }

      if (reportHasPitching(report)) {
        const ipOuts = Number(report.pit_ip_outs || 0)
        const opponentAb = ipOuts + Number(report.pit_h || 0)

        const { error: pitchingError } = await supabase
          .from('pitching_lines')
          .insert({
            game_id: game.id,
            player_id: Number(report.player_id),
            ip_outs: ipOuts,
            h: Number(report.pit_h || 0),
            ab_against: opponentAb,
            er: Number(report.pit_er || 0),
            uer: Number(report.pit_uer || 0),
            bb: Number(report.pit_bb || 0),
            so: Number(report.pit_so || 0),
            hr: Number(report.pit_hr || 0),
            hbp: Number(report.pit_hbp || 0),
            pitches: Number(report.pit_pitches || 0),
            balls: 0,
            strikes: 0,
            w: Number(report.pit_w || 0),
            l: Number(report.pit_l || 0),
            sv: Number(report.pit_sv || 0),
          })

        if (pitchingError) {
          throw pitchingError
        }
      }

      const { error: updateError } = await supabase
        .from('player_stat_reports')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: ADMIN_EMAIL,
        })
        .eq('id', report.id)

      if (updateError) {
        throw updateError
      }

      await loadPendingReports()
      await loadStats()
      await loadGameHistory()

      alert('Report approved and added to season stats.')
    } catch (error) {
      console.error('Error approving report:', error)
      alert('Error approving report. Check console.')
    }
  }

  async function rejectReport(report) {
    if (!requireAdmin()) return

    const confirmed = window.confirm('Reject this player report?')

    if (!confirmed) return

    const { error } = await supabase
      .from('player_stat_reports')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: ADMIN_EMAIL,
      })
      .eq('id', report.id)

    if (error) {
      console.error('Error rejecting report:', error)
      alert('Error rejecting report')
      return
    }

    await loadPendingReports()
  }

  function saveGameLine(event) {
    event.preventDefault()
    saveManualLine()
  }

  async function saveManualLine() {
    if (!requireAdmin()) return

    if (!gameDate) {
      alert('Enter the game date')
      return
    }

    if (!line.player_id) {
      alert('Select a player')
      return
    }

    setSaving(true)

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        game_date: gameDate,
        opponent: opponent || 'No opponent',
        away_team: opponent || 'Opponent',
        home_team: 'Cardenales',
      })
      .select()
      .single()

    if (gameError) {
      console.error('Error creating game:', gameError)
      alert('Error creating game')
      setSaving(false)
      return
    }

    const { error: lineError } = await supabase
      .from('batting_lines')
      .insert({
        game_id: gameData.id,
        player_id: Number(line.player_id),
        ab: line.ab,
        r: line.r,
        h: line.h,
        doubles: line.doubles,
        triples: line.triples,
        hr: line.hr,
        rbi: line.rbi,
        bb: line.bb,
        hbp: line.hbp,
        sf: line.sf,
        so: line.so,
        sb: line.sb,
      })

    if (lineError) {
      console.error('Error saving stats:', lineError)
      alert('Error saving stats')
      setSaving(false)
      return
    }

    setLine(emptyLine)
    setOpponent('')
    await loadStats()
    setSaving(false)
    alert('Stats saved')
  }

  function updatePitchLine(field, value) {
    setPitchLine(prev => ({
      ...prev,
      [field]: field === 'player_id' || field === 'ip' ? value : Number(value),
    }))
  }

  function savePitchingGameLine(event) {
    event.preventDefault()
    savePitchingLine()
  }

  async function savePitchingLine() {
    if (!requireAdmin()) return

    if (!pitchGameDate) {
      alert('Enter the game date')
      return
    }

    if (!pitchLine.player_id) {
      alert('Select a pitcher')
      return
    }

    const ipOuts = parseIpToOuts(pitchLine.ip)

    if (ipOuts === null) {
      alert('IP can only end in .0, .1 or .2. Example: 5.2')
      return
    }

    const opponentAb = Number(pitchLine.ab_against || 0) > 0
      ? Number(pitchLine.ab_against || 0)
      : ipOuts + Number(pitchLine.h || 0)

    setSaving(true)

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        game_date: pitchGameDate,
        opponent: pitchOpponent || 'No opponent',
        away_team: pitchOpponent || 'Opponent',
        home_team: 'Cardenales',
      })
      .select()
      .single()

    if (gameError) {
      console.error('Error creating pitching game:', gameError)
      alert('Error creating pitching game')
      setSaving(false)
      return
    }

    const { error: pitchError } = await supabase
      .from('pitching_lines')
      .insert({
        game_id: gameData.id,
        player_id: Number(pitchLine.player_id),
        ip_outs: ipOuts,
        h: pitchLine.h,
        ab_against: opponentAb,
        er: pitchLine.er,
        uer: pitchLine.uer,
        bb: pitchLine.bb,
        so: pitchLine.so,
        hr: pitchLine.hr,
        hbp: pitchLine.hbp,
        pitches: pitchLine.pitches,
        balls: pitchLine.balls,
        strikes: pitchLine.strikes,
        w: pitchLine.w,
        l: pitchLine.l,
        sv: pitchLine.sv,
      })

    if (pitchError) {
      console.error('Error saving pitching stats:', pitchError)
      alert('Error saving pitching stats')
      setSaving(false)
      return
    }

    setPitchLine(emptyPitchLine)
    setPitchOpponent('')
    await loadStats()
    setSaving(false)
    alert('Pitching stats saved')
  }

  function buildPlayerStats(events, lineup) {
    const stats = lineup.map(player => ({
      player_id: player.player_id,
      name: player.name,
      batting_order: player.batting_order,
      field_position: player.field_position,
      ab: 0,
      r: 0,
      h: 0,
      doubles: 0,
      triples: 0,
      hr: 0,
      rbi: 0,
      bb: 0,
      hbp: 0,
      so: 0,
      sb: 0,
      avg: 0,
    }))

    for (const event of events) {
      const player = stats.find(item => Number(item.player_id) === Number(event.player_id))
      if (!player) continue

      const play = Object.values(playMap).find(item => item.label === event.event_type)
      if (!play) continue

      player.ab += play.ab
      player.r += Number(event.runs_scored || 0)
      player.h += play.h
      player.doubles += play.doubles
      player.triples += play.triples
      player.hr += play.hr
      player.rbi += Number(event.rbi || 0)
      player.bb += play.bb
      player.hbp += play.hbp
      player.so += play.so
      player.sb += play.sb
    }

    return stats.map(player => ({
      ...player,
      avg: player.ab > 0 ? player.h / player.ab : 0,
    }))
  }

  function renderScoreboard(game) {
    if (!game) return null

    const cardenalesIsAway = game.away_team === 'Cardenales'

    const awayRow = cardenalesIsAway
      ? {
          name: 'Cardenales',
          i1: game.cardenales_i1,
          i2: game.cardenales_i2,
          i3: game.cardenales_i3,
          i4: game.cardenales_i4,
          i5: game.cardenales_i5,
          i6: game.cardenales_i6,
          i7: game.cardenales_i7,
          i8: game.cardenales_i8,
          i9: game.cardenales_i9,
          r: game.cardenales_runs,
          h: game.cardenales_hits,
          e: game.cardenales_errors,
        }
      : {
          name: game.away_team || game.opponent || 'Opponent',
          i1: game.opponent_i1,
          i2: game.opponent_i2,
          i3: game.opponent_i3,
          i4: game.opponent_i4,
          i5: game.opponent_i5,
          i6: game.opponent_i6,
          i7: game.opponent_i7,
          i8: game.opponent_i8,
          i9: game.opponent_i9,
          r: game.opponent_runs,
          h: game.opponent_hits,
          e: game.opponent_errors,
        }

    const homeRow = cardenalesIsAway
      ? {
          name: game.home_team || game.opponent || 'Opponent',
          i1: game.opponent_i1,
          i2: game.opponent_i2,
          i3: game.opponent_i3,
          i4: game.opponent_i4,
          i5: game.opponent_i5,
          i6: game.opponent_i6,
          i7: game.opponent_i7,
          i8: game.opponent_i8,
          i9: game.opponent_i9,
          r: game.opponent_runs,
          h: game.opponent_hits,
          e: game.opponent_errors,
        }
      : {
          name: 'Cardenales',
          i1: game.cardenales_i1,
          i2: game.cardenales_i2,
          i3: game.cardenales_i3,
          i4: game.cardenales_i4,
          i5: game.cardenales_i5,
          i6: game.cardenales_i6,
          i7: game.cardenales_i7,
          i8: game.cardenales_i8,
          i9: game.cardenales_i9,
          r: game.cardenales_runs,
          h: game.cardenales_hits,
          e: game.cardenales_errors,
        }

    function renderRow(row) {
      return (
        <div className="score-row">
          <span>{row.name}</span>
          <span>{row.i1 || 0}</span>
          <span>{row.i2 || 0}</span>
          <span>{row.i3 || 0}</span>
          <span>{row.i4 || 0}</span>
          <span>{row.i5 || 0}</span>
          <span>{row.i6 || 0}</span>
          <span>{row.i7 || 0}</span>
          <span>{row.i8 || 0}</span>
          <span>{row.i9 || 0}</span>
          <span>{row.r || 0}</span>
          <span>{row.h || 0}</span>
          <span>{row.e || 0}</span>
        </div>
      )
    }

    return (
      <div className="scoreboard baseball-scoreboard">
        <div className="score-row score-header">
          <span>Team</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>R</span>
          <span>H</span>
          <span>E</span>
        </div>

        {renderRow(awayRow)}
        {renderRow(homeRow)}
      </div>
    )
  }

  function renderField(lineup) {
    const getName = position => lineup.find(player => player.field_position === position)?.name || position

    return (
      <div className="field-card">
        <h3>Defensive Field</h3>

        <div className="stadium-field">
          <div className="outfield-arc"></div>
          <div className="left-foul-line"></div>
          <div className="right-foul-line"></div>
          <div className="infield-diamond"></div>
          <div className="mound"></div>

          <div className="base home-base">H</div>
          <div className="base first-base">1B</div>
          <div className="base second-base">2B</div>
          <div className="base third-base">3B</div>

          <div className="field-player pos-p">{getName('P')}</div>
          <div className="field-player pos-c">{getName('C')}</div>
          <div className="field-player pos-1b">{getName('1B')}</div>
          <div className="field-player pos-2b">{getName('2B')}</div>
          <div className="field-player pos-3b">{getName('3B')}</div>
          <div className="field-player pos-ss">{getName('SS')}</div>
          <div className="field-player pos-lf">{getName('LF')}</div>
          <div className="field-player pos-cf">{getName('CF')}</div>
          <div className="field-player pos-rf">{getName('RF')}</div>
        </div>
      </div>
    )
  }

  function getOpponentName(game) {
    if (!game) return ''
    return game.away_team === 'Cardenales' ? game.home_team : game.away_team
  }

  const historyGroups = gameHistory.reduce((groups, game) => {
    const opponentName = getOpponentName(game) || game.opponent || 'Opponent'
    const groupKey = `${formatDate(game.game_date)} vs ${opponentName}`

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }

    groups[groupKey].push(game)
    return groups
  }, {})

  const currentBatter = getCurrentBatter()
  const livePlayerStats = buildPlayerStats(gameEvents, gameStatsLineup)
  const historyPlayerStats = buildPlayerStats(selectedHistoryEvents, selectedHistoryStatsLineup)
  const cardenalesBatting = isCardenalesBatting(activeGame)
  const opponentBatting = activeGame && !cardenalesBatting

  const qualifiedPlayers = players.filter(p => Number(p.ab) >= 3)
  const avgLeader = [...qualifiedPlayers].sort((a, b) => Number(b.avg) - Number(a.avg))[0]
  const hitLeader = [...players].sort((a, b) => Number(b.h) - Number(a.h))[0]
  const hrLeader = [...players].sort((a, b) => Number(b.hr) - Number(a.hr))[0]
  const rbiLeader = [...players].sort((a, b) => Number(b.rbi) - Number(a.rbi))[0]
  const sbLeader = [...players].sort((a, b) => Number(b.sb) - Number(a.sb))[0]
  const opsLeader = [...qualifiedPlayers].sort((a, b) => Number(b.ops) - Number(a.ops))[0]

  const qualifiedPitchers = pitchingPlayers.filter(p => Number(p.ip_outs) >= 3)
  const eraLeader = [...qualifiedPitchers].sort((a, b) => Number(a.era) - Number(b.era))[0]
  const whipLeader = [...qualifiedPitchers].sort((a, b) => Number(a.whip) - Number(b.whip))[0]
  const baaLeader = [...qualifiedPitchers].filter(p => Number(p.ab_against) > 0).sort((a, b) => Number(a.baa) - Number(b.baa))[0]
  const strikeoutLeader = [...pitchingPlayers].sort((a, b) => Number(b.so) - Number(a.so))[0]
  const walkLeader = [...pitchingPlayers].sort((a, b) => Number(b.bb) - Number(a.bb))[0]
  const inningsLeader = [...pitchingPlayers].sort((a, b) => Number(b.ip_outs) - Number(a.ip_outs))[0]

  return (
    <div className="app">
      <header className="header">
        <div className="brand-block">
          <div className="brand-left">
            <img
              src="/cardenales-logo.png"
              alt="Cardenales logo"
              className="team-logo"
            />

            <div>
              <p className="eyebrow">Baseball Team</p>
              <h1>Cardenales</h1>
              <p className="subtitle">Live scorekeeper, batting stats and pitching stats</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={loadAll}>Refresh</button>

          {isAdmin ? (
            <div className="admin-badge">
              <span>Admin</span>
              <button className="secondary-button small-button" onClick={signOutAdmin}>Logout</button>
            </div>
          ) : (
            <form className="login-box" onSubmit={signInAdmin}>
              <input
                type="email"
                placeholder="Admin email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />

              <button type="submit" disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Admin Login'}
              </button>

              {authError && <small>{authError}</small>}
            </form>
          )}
        </div>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'live' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('live')}>Live Game</button>
        <button className={activeTab === 'report' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('report')}>Player Report</button>
        <button className={activeTab === 'history' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('history')}>Game History</button>
        <button className={activeTab === 'season' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('season')}>Season Stats</button>
        {isAdmin && (
          <button className={activeTab === 'review' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('review')}>
            Review Reports
            {pendingReports.length > 0 ? ` (${pendingReports.length})` : ''}
          </button>
        )}
      </nav>

      {activeTab === 'live' && (
        <section className="live-section">
          <h2>Live Game</h2>

          {!activeGame ? (
            isAdmin ? (
              <form onSubmit={createLiveGame} className="game-form">
              <div className="form-row">
                <label>
                  Date
                  <input type="date" value={liveDate} onChange={e => setLiveDate(e.target.value)} />
                </label>

                <label>
                  Time
                  <input type="time" value={liveTime} onChange={e => setLiveTime(e.target.value)} />
                </label>

                <label>
                  Opponent Name
                  <input type="text" placeholder="Ex: Dodgers" value={liveOpponent} onChange={e => setLiveOpponent(e.target.value)} />
                </label>

                <label>
                  Cardenales Side
                  <select value={cardenalesSide} onChange={e => setCardenalesSide(e.target.value)}>
                    <option value="home">Cardenales Home</option>
                    <option value="away">Cardenales Away</option>
                  </select>
                </label>
              </div>

              <div className="lineup-builder">
                <h3>Lineup Builder</h3>
                <p>Select starters, batting order and defensive position.</p>

                <div className="lineup-table">
                  {lineupRows.map(row => (
                    <div className="lineup-row" key={row.player_id}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={row.is_starter}
                          onChange={e => updateLineupRow(row.player_id, 'is_starter', e.target.checked)}
                        />
                        {row.name}
                      </label>

                      <input
                        type="number"
                        min="1"
                        placeholder="Order"
                        value={row.batting_order}
                        onChange={e => updateLineupRow(row.player_id, 'batting_order', e.target.value)}
                      />

                      <select
                        value={row.field_position}
                        onChange={e => updateLineupRow(row.player_id, 'field_position', e.target.value)}
                      >
                        <option value="">Position</option>
                        {positions.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit">Create Live Game</button>
              </form>
            ) : (
              <div className="opponent-panel">
                <h3>No live game right now</h3>
                <p>When a live game starts, the scoreboard, lineup, field and live player stats will appear here.</p>
              </div>
            )
          ) : (
            <>
              <div className="game-title">
                <strong>{formatDate(activeGame.game_date)} {formatTime(activeGame.game_time)}</strong>
                <span>{activeGame.away_team} at {activeGame.home_team}</span>
              </div>

              {renderScoreboard(activeGame)}

              <div className="game-state">
                <strong>{activeGame.half_inning} {activeGame.inning}</strong>
                <span>Outs: {activeGame.outs}</span>
                <span>{cardenalesBatting ? 'Cardenales Batting' : `${activeGame.opponent} Batting`}</span>
                <span>Next Cardenales Batter: {currentBatter?.name || '-'}</span>
              </div>

              {gameLineup.length === 0 && (
                <div className="opponent-panel">
                  <h3>No lineup loaded</h3>
                  <p>This active game has no saved lineup. End this game and create a new one with starters, batting order and positions.</p>
                  {isAdmin && <button className="secondary-button" onClick={endLiveGame}>End This Broken Game</button>}
                </div>
              )}

              {gameLineup.length > 0 && (
                <>
                  <div className="field-lineup-layout">
                    {renderField(gameLineup)}

                    <div className="batting-order">
                      <h3>Batting Order</h3>

                      <div className="batting-order-buttons vertical-order">
                        {gameLineup.map((player, index) => (
                          <button
                            key={player.id}
                            className={index === currentBatterIndex ? 'batter-button active-batter' : 'batter-button'}
                            onClick={() => isAdmin && setCurrentBatter(index)}
                          >
                            <span className="order-number">{player.batting_order}</span>
                            <span className="order-name">{player.name}</span>
                            <span className="order-pos">{player.field_position}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                  <div className="substitution-panel">
                    <h3>Substitution</h3>

                    <form onSubmit={makeSubstitution} className="substitution-form">
                      <label>
                        Player Out
                        <select value={subPlayerOut} onChange={e => setSubPlayerOut(e.target.value)}>
                          <option value="">Select player out</option>
                          {gameLineup.map(player => (
                            <option key={player.player_id} value={player.player_id}>
                              {player.name} - {player.field_position} - Batting {player.batting_order}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Player In
                        <select value={subPlayerIn} onChange={e => setSubPlayerIn(e.target.value)}>
                          <option value="">Select player in</option>
                          {playersList
                            .filter(player => !gameLineup.some(row => Number(row.player_id) === Number(player.id)))
                            .map(player => (
                              <option key={player.id} value={player.id}>
                                {player.name}
                              </option>
                            ))}
                        </select>
                      </label>

                      <label>
                        New Position
                        <select value={subPosition} onChange={e => setSubPosition(e.target.value)}>
                          <option value="">Position</option>
                          {positions.map(position => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button type="submit">Make Substitution</button>
                    </form>
                  </div>

                  )}

                  {isAdmin && (opponentBatting ? (
                    <div className="opponent-panel">
                      <h3>Opponent Batting</h3>
                      <p>Only update opponent runs, opponent hits and Cardenales errors here.</p>

                      <div className="live-controls">
                        <label>
                          Opponent Runs
                          <input type="number" min="0" value={opponentRunsInput} onChange={e => setOpponentRunsInput(Number(e.target.value))} />
                        </label>

                        <label>
                          Opponent Hits
                          <input type="number" min="0" value={opponentHitsInput} onChange={e => setOpponentHitsInput(Number(e.target.value))} />
                        </label>

                        <label>
                          Cardenales Errors
                          <input type="number" min="0" value={opponentErrorsInput} onChange={e => setOpponentErrorsInput(Number(e.target.value))} />
                        </label>
                      </div>

                      <div className="live-actions">
                        <button onClick={addOpponentStats}>Add Opponent Stats</button>
                        <button className="secondary-button" onClick={recordOpponentOut}>Opponent Out</button>
                        <button className="secondary-button" onClick={endLiveGame}>End & Save Game</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="live-controls">
                        <label>
                          Runs Scored
                          <input type="number" min="0" value={runsScored} onChange={e => setRunsScored(Number(e.target.value))} />
                        </label>

                        <label>
                          RBI
                          <input type="number" min="0" value={rbi} onChange={e => setRbi(Number(e.target.value))} />
                        </label>
                      </div>

                      <div className="play-buttons">
                        <button onClick={() => recordPlay('single')}>Single</button>
                        <button onClick={() => recordPlay('double')}>Double</button>
                        <button onClick={() => recordPlay('triple')}>Triple</button>
                        <button onClick={() => recordPlay('homerun')}>Home Run</button>
                        <button onClick={() => recordPlay('walk')}>Walk</button>
                        <button onClick={() => recordPlay('hbp')}>HBP</button>
                        <button onClick={() => recordPlay('strikeout')}>Strikeout</button>
                        <button onClick={() => recordPlay('out')}>Out</button>
                        <button onClick={() => recordPlay('doubleplay')}>Double Play</button>
                        <button onClick={() => recordPlay('stolenbase')}>Stolen Base</button>
                      </div>

                      <div className="live-actions">
                        <button className="undo-button" onClick={undoLastPlay}>Undo Last Play</button>
                        <button className="secondary-button" onClick={endLiveGame}>End & Save Game</button>
                      </div>
                    </>
                  ))}

                  <section className="live-player-section">
                    <h2>Live Game Player Stats</h2>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>PLAYER</th>
                            <th>POS</th>
                            <th>AB</th>
                            <th>R</th>
                            <th>H</th>
                            <th>2B</th>
                            <th>3B</th>
                            <th>HR</th>
                            <th>RBI</th>
                            <th>BB</th>
                            <th>HBP</th>
                            <th>SO</th>
                            <th>SB</th>
                            <th>AVG</th>
                          </tr>
                        </thead>

                        <tbody>
                          {livePlayerStats.map(player => (
                            <tr key={`${player.player_id}-${player.batting_order}`}>
                              <td className="player-name">{player.name}</td>
                              <td>{player.field_position}</td>
                              <td>{player.ab}</td>
                              <td>{player.r}</td>
                              <td>{player.h}</td>
                              <td>{player.doubles}</td>
                              <td>{player.triples}</td>
                              <td>{player.hr}</td>
                              <td>{player.rbi}</td>
                              <td>{player.bb}</td>
                              <td>{player.hbp}</td>
                              <td>{player.so}</td>
                              <td>{player.sb}</td>
                              <td>{formatStat(player.avg)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </section>
      )}


      {activeTab === 'report' && (
        <section className="live-section">
          <h2>Player Game Report</h2>
          <form onSubmit={submitPlayerReport} className="game-form report-form">
            <div className="form-row">
              <label>
                Date
                <input type="date" value={playerReport.game_date} onChange={e => updatePlayerReport('game_date', e.target.value)} />
              </label>

              <label>
                Opponent
                <input type="text" placeholder="Ex: Dodgers" value={playerReport.opponent} onChange={e => updatePlayerReport('opponent', e.target.value)} />
              </label>

              <label>
                Game
                <select value={playerReport.game_label} onChange={e => updatePlayerReport('game_label', e.target.value)}>
                  <option value="Game 1">Game 1</option>
                  <option value="Game 2">Game 2</option>
                </select>
              </label>

              <label>
                Player
                <select value={playerReport.player_id} onChange={e => updatePlayerReport('player_id', e.target.value)}>
                  <option value="">Select your name</option>
                  {playersList.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}{player.number ? ` #${player.number}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="report-grid">
              <div className="report-card">
                <h3>Batting</h3>

                <div className="stats-grid">
                  {[
                    ['bat_ab', 'AB'],
                    ['bat_r', 'R'],
                    ['bat_h', 'H'],
                    ['bat_doubles', '2B'],
                    ['bat_triples', '3B'],
                    ['bat_hr', 'HR'],
                    ['bat_rbi', 'RBI'],
                    ['bat_bb', 'BB'],
                    ['bat_hbp', 'HBP'],
                    ['bat_sf', 'SF'],
                    ['bat_so', 'SO'],
                    ['bat_sb', 'SB'],
                  ].map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" min="0" value={playerReport[field]} onChange={e => updatePlayerReport(field, e.target.value)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="report-card">
                <h3>Pitching</h3>

                <div className="stats-grid">
                  <label>
                    IP
                    <input type="text" placeholder="Ex: 5.2" value={playerReport.pit_ip} onChange={e => updatePlayerReport('pit_ip', e.target.value)} />
                  </label>

                  {[
                    ['pit_h', 'H'],
                    ['pit_er', 'ER'],
                    ['pit_uer', 'UER'],
                    ['pit_bb', 'BB'],
                    ['pit_so', 'SO'],
                    ['pit_hr', 'HR'],
                    ['pit_hbp', 'HBP'],
                    ['pit_pitches', 'Pitches'],
                    ['pit_w', 'W'],
                    ['pit_l', 'L'],
                    ['pit_sv', 'SV'],
                  ].map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" min="0" value={playerReport[field]} onChange={e => updatePlayerReport(field, e.target.value)} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <label>
              Notes / correction
              <textarea
                value={playerReport.notes}
                onChange={e => updatePlayerReport('notes', e.target.value)}
                placeholder="Optional: notes or correction"
              />
            </label>

            <button type="submit" disabled={reportSaving}>
              {reportSaving ? 'Submitting...' : 'Submit Report for Review'}
            </button>
          </form>
        </section>
      )}

      {isAdmin && activeTab === 'review' && (
        <section className="live-section">
          <div className="review-header">
            <div>
              <h2>Review Player Reports</h2>
              <p className="public-note">Approve reports to add them to official season stats.</p>
            </div>

            <button onClick={loadPendingReports}>Refresh Reports</button>
          </div>

          {reviewLoading ? (
            <p>Loading reports...</p>
          ) : pendingReports.length === 0 ? (
            <p>No pending reports.</p>
          ) : (
            <div className="reports-list">
              {pendingReports.map(report => (
                <div className="report-review-card" key={report.id}>
                  <div className="report-review-top">
                    <div>
                      <strong>{report.players?.name || 'Player'}{report.players?.number ? ` #${report.players.number}` : ''}</strong>
                      <span>{formatDate(report.game_date)} - {report.game_label || 'Game 1'} vs {report.opponent}</span>
                    </div>

                    <small>{new Date(report.created_at).toLocaleString()}</small>
                  </div>

                  <div className="review-stats-grid">
                    <div>
                      <h4>Batting</h4>
                      <p>AB {report.bat_ab || 0} | R {report.bat_r || 0} | H {report.bat_h || 0} | 2B {report.bat_doubles || 0} | 3B {report.bat_triples || 0} | HR {report.bat_hr || 0}</p>
                      <p>RBI {report.bat_rbi || 0} | BB {report.bat_bb || 0} | HBP {report.bat_hbp || 0} | SF {report.bat_sf || 0} | SO {report.bat_so || 0} | SB {report.bat_sb || 0}</p>
                    </div>

                    <div>
                      <h4>Pitching</h4>
                      <p>IP {report.pit_ip || '0.0'} | H {report.pit_h || 0} | ER {report.pit_er || 0} | UER {report.pit_uer || 0}</p>
                      <p>BB {report.pit_bb || 0} | SO {report.pit_so || 0} | HR {report.pit_hr || 0} | HBP {report.pit_hbp || 0} | Pitches {report.pit_pitches || 0} | W {report.pit_w || 0} | L {report.pit_l || 0} | SV {report.pit_sv || 0}</p>
                    </div>
                  </div>

                  {report.notes && (
                    <p className="report-notes"><strong>Notes:</strong> {report.notes}</p>
                  )}

                  <div className="live-actions">
                    <button onClick={() => approveReport(report)}>Approve</button>
                    <button className="undo-button" onClick={() => rejectReport(report)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="live-section">
          <h2>Game History</h2>
          <p className="public-note">
            Historical player performance by opponent and game. Only the final runs are tracked here.
          </p>

          <div className="history-grid">
            <div className="history-list grouped-history-list">
              {gameHistory.length === 0 ? (
                <p>No completed games yet.</p>
              ) : (
                Object.entries(historyGroups).map(([groupName, games]) => (
                  <div className="history-group" key={groupName}>
                    <h3>{groupName}</h3>

                    {games.map(game => (
                      <button
                        key={game.id}
                        className="history-item"
                        onClick={() => openHistoryGame(game)}
                      >
                        <strong>{game.game_label || 'Game'}</strong>
                        <span>Cardenales vs {getOpponentName(game) || game.opponent || 'Opponent'}</span>
                        <small>Final: Cardenales {game.cardenales_runs || 0} - {game.opponent_runs || 0}</small>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="history-detail">
              {!selectedHistoryGame ? (
                <p>Select a game to view player stats.</p>
              ) : (
                <>
                  <div className="simple-score-card">
                    <div>
                      <p className="eyebrow">{formatDate(selectedHistoryGame.game_date)} - {selectedHistoryGame.game_label || 'Game'}</p>
                      <h3>Cardenales vs {getOpponentName(selectedHistoryGame) || selectedHistoryGame.opponent || 'Opponent'}</h3>
                    </div>

                    <div className="final-score-display">
                      <span>Cardenales</span>
                      <strong>{selectedHistoryGame.cardenales_runs || 0}</strong>
                      <span>{getOpponentName(selectedHistoryGame) || selectedHistoryGame.opponent || 'Opponent'}</span>
                      <strong>{selectedHistoryGame.opponent_runs || 0}</strong>
                    </div>
                  </div>

                  {isAdmin && (
                    <form className="score-edit-form" onSubmit={saveHistoryFinalScore}>
                      <label>
                        Cardenales Runs
                        <input
                          type="number"
                          min="0"
                          value={historyScoreCardenales}
                          onChange={e => setHistoryScoreCardenales(Number(e.target.value))}
                        />
                      </label>

                      <label>
                        Opponent Runs
                        <input
                          type="number"
                          min="0"
                          value={historyScoreOpponent}
                          onChange={e => setHistoryScoreOpponent(Number(e.target.value))}
                        />
                      </label>

                      <button type="submit" disabled={historyScoreSaving}>
                        {historyScoreSaving ? 'Saving...' : 'Save Final Score'}
                      </button>
                    </form>
                  )}

                  {(selectedHistoryBattingLines.length > 0 || selectedHistoryPitchingLines.length > 0) ? (
                    <>
                      {selectedHistoryBattingLines.length > 0 && (
                        <>
                          <h3>Batting Lines</h3>

                          <div className="table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  <th>PLAYER</th>
                                  <th>#</th>
                                  <th>AB</th>
                                  <th>R</th>
                                  <th>H</th>
                                  <th>2B</th>
                                  <th>3B</th>
                                  <th>HR</th>
                                  <th>RBI</th>
                                  <th>BB</th>
                                  <th>HBP</th>
                                  <th>SF</th>
                                  <th>SO</th>
                                  <th>SB</th>
                                  <th>AVG</th>
                                </tr>
                              </thead>

                              <tbody>
                                {selectedHistoryBattingLines.map(row => {
                                  const avg = Number(row.ab || 0) > 0 ? Number(row.h || 0) / Number(row.ab || 0) : 0

                                  return (
                                    <tr key={`bat-${row.id}`}>
                                      <td className="player-name">{row.players?.name || '-'}</td>
                                      <td>{row.players?.number || ''}</td>
                                      <td>{row.ab || 0}</td>
                                      <td>{row.r || 0}</td>
                                      <td>{row.h || 0}</td>
                                      <td>{row.doubles || 0}</td>
                                      <td>{row.triples || 0}</td>
                                      <td>{row.hr || 0}</td>
                                      <td>{row.rbi || 0}</td>
                                      <td>{row.bb || 0}</td>
                                      <td>{row.hbp || 0}</td>
                                      <td>{row.sf || 0}</td>
                                      <td>{row.so || 0}</td>
                                      <td>{row.sb || 0}</td>
                                      <td>{formatStat(avg)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      {selectedHistoryPitchingLines.length > 0 && (
                        <>
                          <h3>Pitching Lines</h3>

                          <div className="table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  <th>PLAYER</th>
                                  <th>#</th>
                                  <th>IP</th>
                                  <th>H</th>
                                  <th>ER</th>
                                  <th>UER</th>
                                  <th>BB</th>
                                  <th>SO</th>
                                  <th>HR</th>
                                  <th>HBP</th>
                                  <th>PITCHES</th>
                                  <th>W</th>
                                  <th>L</th>
                                  <th>SV</th>
                                </tr>
                              </thead>

                              <tbody>
                                {selectedHistoryPitchingLines.map(row => (
                                  <tr key={`pit-${row.id}`}>
                                    <td className="player-name">{row.players?.name || '-'}</td>
                                    <td>{row.players?.number || ''}</td>
                                    <td>{formatIpFromOuts(row.ip_outs)}</td>
                                    <td>{row.h || 0}</td>
                                    <td>{row.er || 0}</td>
                                    <td>{row.uer || 0}</td>
                                    <td>{row.bb || 0}</td>
                                    <td>{row.so || 0}</td>
                                    <td>{row.hr || 0}</td>
                                    <td>{row.hbp || 0}</td>
                                    <td>{row.pitches || 0}</td>
                                    <td>{row.w || 0}</td>
                                    <td>{row.l || 0}</td>
                                    <td>{row.sv || 0}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <h3>Live Game Player Stats</h3>

                      {historyPlayerStats.length === 0 ? (
                        <p>No player stats saved for this game yet.</p>
                      ) : (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>PLAYER</th>
                                <th>POS</th>
                                <th>AB</th>
                                <th>R</th>
                                <th>H</th>
                                <th>2B</th>
                                <th>3B</th>
                                <th>HR</th>
                                <th>RBI</th>
                                <th>BB</th>
                                <th>HBP</th>
                                <th>SO</th>
                                <th>SB</th>
                                <th>AVG</th>
                              </tr>
                            </thead>

                            <tbody>
                              {historyPlayerStats.map(player => (
                                <tr key={`${player.player_id}-${player.batting_order}`}>
                                  <td className="player-name">{player.name}</td>
                                  <td>{player.field_position}</td>
                                  <td>{player.ab}</td>
                                  <td>{player.r}</td>
                                  <td>{player.h}</td>
                                  <td>{player.doubles}</td>
                                  <td>{player.triples}</td>
                                  <td>{player.hr}</td>
                                  <td>{player.rbi}</td>
                                  <td>{player.bb}</td>
                                  <td>{player.hbp}</td>
                                  <td>{player.so}</td>
                                  <td>{player.sb}</td>
                                  <td>{formatStat(player.avg)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'season' && (
        <>
          <section className="season-category">
            <div className="season-category-header">
              <div>
                <p className="eyebrow">Season Stats</p>
                <h2>Batting</h2>
              </div>
              <span>Individual batting first, team batting totals below.</span>
            </div>

            {isAdmin && (
            <section className="form-section season-inner-card">
              <h2>Add Manual Batting Stats</h2>

              <form onSubmit={saveGameLine} className="game-form">
                <div className="form-row">
                  <label>
                    Date
                    <input type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} />
                  </label>

                  <label>
                    Opponent
                    <input type="text" placeholder="Ex: Dodgers" value={opponent} onChange={e => setOpponent(e.target.value)} />
                  </label>

                  <label>
                    Player
                    <select value={line.player_id} onChange={e => updateLine('player_id', e.target.value)}>
                      <option value="">Select</option>
                      {playersList.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="stats-grid">
                  {[
                    ['ab', 'AB'],
                    ['r', 'R'],
                    ['h', 'H'],
                    ['doubles', '2B'],
                    ['triples', '3B'],
                    ['hr', 'HR'],
                    ['rbi', 'RBI'],
                    ['bb', 'BB'],
                    ['hbp', 'HBP'],
                    ['sf', 'SF'],
                    ['so', 'SO'],
                    ['sb', 'SB'],
                  ].map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" min="0" value={line[field]} onChange={e => updateLine(field, e.target.value)} />
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Batting Stats'}
                </button>
              </form>
            </section>

            )}

            {loading ? (
              <p>Loading batting stats...</p>
            ) : (
              <>
                <section className="leaders season-inner-card">
                  <h2>Season Batting Leaders</h2>

                  <div className="cards">
                    <div className="card"><span>AVG</span><strong>{avgLeader?.name || '-'}</strong><p>{avgLeader ? formatStat(avgLeader.avg) : '-'}</p></div>
                    <div className="card"><span>H</span><strong>{hitLeader?.name || '-'}</strong><p>{hitLeader?.h ?? '-'}</p></div>
                    <div className="card"><span>HR</span><strong>{hrLeader?.name || '-'}</strong><p>{hrLeader?.hr ?? '-'}</p></div>
                    <div className="card"><span>RBI</span><strong>{rbiLeader?.name || '-'}</strong><p>{rbiLeader?.rbi ?? '-'}</p></div>
                    <div className="card"><span>SB</span><strong>{sbLeader?.name || '-'}</strong><p>{sbLeader?.sb ?? '-'}</p></div>
                    <div className="card"><span>OPS</span><strong>{opsLeader?.name || '-'}</strong><p>{opsLeader ? formatStat(opsLeader.ops) : '-'}</p></div>
                  </div>
                </section>

                <section className="stats-section season-inner-card">
                  <h2>Individual Batting Stats</h2>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>PLAYER</th>
                          <th>AB</th>
                          <th>R</th>
                          <th>H</th>
                          <th>2B</th>
                          <th>3B</th>
                          <th>HR</th>
                          <th>RBI</th>
                          <th>BB</th>
                          <th>HBP</th>
                          <th>SF</th>
                          <th>SO</th>
                          <th>SB</th>
                          <th>AVG</th>
                          <th>OBP</th>
                          <th>SLG</th>
                          <th>OPS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {players.map(player => (
                          <tr key={player.player_id}>
                            <td className="player-name">{player.name}</td>
                            <td>{player.ab}</td>
                            <td>{player.r}</td>
                            <td>{player.h}</td>
                            <td>{player.doubles}</td>
                            <td>{player.triples}</td>
                            <td>{player.hr}</td>
                            <td>{player.rbi}</td>
                            <td>{player.bb}</td>
                            <td>{player.hbp}</td>
                            <td>{player.sf}</td>
                            <td>{player.so}</td>
                            <td>{player.sb}</td>
                            <td>{formatStat(player.avg)}</td>
                            <td>{formatStat(player.obp)}</td>
                            <td>{formatStat(player.slg)}</td>
                            <td>{formatStat(player.ops)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="stats-section season-inner-card team-total-section">
                  <h2>Team Batting Totals</h2>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>TEAM</th>
                          <th>AB</th>
                          <th>R</th>
                          <th>H</th>
                          <th>2B</th>
                          <th>3B</th>
                          <th>HR</th>
                          <th>RBI</th>
                          <th>BB</th>
                          <th>HBP</th>
                          <th>SF</th>
                          <th>SO</th>
                          <th>SB</th>
                          <th>AVG</th>
                          <th>OBP</th>
                          <th>SLG</th>
                          <th>OPS</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="team-total-row">
                          <td className="player-name">Cardenales</td>
                          <td>{teamBattingTotals.ab ?? 0}</td>
                          <td>{teamBattingTotals.r ?? 0}</td>
                          <td>{teamBattingTotals.h ?? 0}</td>
                          <td>{teamBattingTotals.doubles ?? 0}</td>
                          <td>{teamBattingTotals.triples ?? 0}</td>
                          <td>{teamBattingTotals.hr ?? 0}</td>
                          <td>{teamBattingTotals.rbi ?? 0}</td>
                          <td>{teamBattingTotals.bb ?? 0}</td>
                          <td>{teamBattingTotals.hbp ?? 0}</td>
                          <td>{teamBattingTotals.sf ?? 0}</td>
                          <td>{teamBattingTotals.so ?? 0}</td>
                          <td>{teamBattingTotals.sb ?? 0}</td>
                          <td>{formatStat(teamBattingTotals.avg)}</td>
                          <td>{formatStat(teamBattingTotals.obp)}</td>
                          <td>{formatStat(teamBattingTotals.slg)}</td>
                          <td>{formatStat(teamBattingTotals.ops)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </section>

          <section className="season-category">
            <div className="season-category-header">
              <div>
                <p className="eyebrow">Season Stats</p>
                <h2>Pitching</h2>
              </div>
              <span>Individual pitching first, team pitching totals below.</span>
            </div>

            {isAdmin && (
            <section className="form-section season-inner-card">
              <h2>Add Manual Pitching Stats</h2>

              <form onSubmit={savePitchingGameLine} className="game-form">
                <div className="form-row">
                  <label>
                    Date
                    <input type="date" value={pitchGameDate} onChange={e => setPitchGameDate(e.target.value)} />
                  </label>

                  <label>
                    Opponent
                    <input type="text" placeholder="Ex: Dodgers" value={pitchOpponent} onChange={e => setPitchOpponent(e.target.value)} />
                  </label>

                  <label>
                    Pitcher
                    <select value={pitchLine.player_id} onChange={e => updatePitchLine('player_id', e.target.value)}>
                      <option value="">Select</option>
                      {playersList.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="stats-grid">
                  <label>
                    IP
                    <input
                      type="text"
                      placeholder="Ex: 5.2"
                      value={pitchLine.ip}
                      onChange={e => updatePitchLine('ip', e.target.value)}
                    />
                  </label>

                  {[
                    ['h', 'H'],
                    ['er', 'ER Allowed'],
                    ['uer', 'UER Allowed'],
                    ['bb', 'BB'],
                    ['so', 'SO'],
                    ['hr', 'HR'],
                    ['hbp', 'HBP'],
                    ['pitches', 'Pitches'],
                    ['balls', 'Balls'],
                    ['strikes', 'Strikes'],
                    ['w', 'W'],
                    ['l', 'L'],
                    ['sv', 'SV'],
                  ].map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" min="0" value={pitchLine[field]} onChange={e => updatePitchLine(field, e.target.value)} />
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Pitching Stats'}
                </button>
              </form>
            </section>

            )}

            {loading ? (
              <p>Loading pitching stats...</p>
            ) : (
              <>
                <section className="leaders season-inner-card">
                  <h2>Season Pitching Leaders</h2>

                  <div className="cards">
                    <div className="card"><span>ERA</span><strong>{eraLeader?.name || '-'}</strong><p>{eraLeader ? formatDecimal2(eraLeader.era) : '-'}</p></div>
                    <div className="card"><span>WHIP</span><strong>{whipLeader?.name || '-'}</strong><p>{whipLeader ? formatDecimal2(whipLeader.whip) : '-'}</p></div>
                    <div className="card"><span>BAA</span><strong>{baaLeader?.name || '-'}</strong><p>{baaLeader ? formatStat(baaLeader.baa) : '-'}</p></div>
                    <div className="card"><span>SO</span><strong>{strikeoutLeader?.name || '-'}</strong><p>{strikeoutLeader?.so ?? '-'}</p></div>
                    <div className="card"><span>BB</span><strong>{walkLeader?.name || '-'}</strong><p>{walkLeader?.bb ?? '-'}</p></div>
                    <div className="card"><span>IP</span><strong>{inningsLeader?.name || '-'}</strong><p>{inningsLeader?.ip || '-'}</p></div>
                  </div>
                </section>

                <section className="stats-section season-inner-card">
                  <h2>Individual Pitching Stats</h2>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>PLAYER</th>
                          <th>IP</th>
                          <th>H</th>
                          <th>OPP AB</th>
                          <th>ER</th>
                          <th>UER</th>
                          <th>BB</th>
                          <th>SO</th>
                          <th>HR</th>
                          <th>HBP</th>
                          <th>PITCHES</th>
                          <th>BALLS</th>
                          <th>STRIKES</th>
                          <th>W</th>
                          <th>L</th>
                          <th>SV</th>
                          <th>ERA</th>
                          <th>WHIP</th>
                          <th>BAA</th>
                          <th>K/BB</th>
                          <th>K/9</th>
                          <th>BB/9</th>
                          <th>STRIKE %</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pitchingPlayers.map(player => (
                          <tr key={player.player_id}>
                            <td className="player-name">{player.name}</td>
                            <td>{player.ip || '0.0'}</td>
                            <td>{player.h}</td>
                            <td>{player.ab_against}</td>
                            <td>{player.er}</td>
                            <td>{player.uer}</td>
                            <td>{player.bb}</td>
                            <td>{player.so}</td>
                            <td>{player.hr}</td>
                            <td>{player.hbp}</td>
                            <td>{player.pitches}</td>
                            <td>{player.balls}</td>
                            <td>{player.strikes}</td>
                            <td>{player.w}</td>
                            <td>{player.l}</td>
                            <td>{player.sv}</td>
                            <td>{formatDecimal2(player.era)}</td>
                            <td>{formatDecimal2(player.whip)}</td>
                            <td>{formatStat(player.baa)}</td>
                            <td>{formatStat(player.k_bb)}</td>
                            <td>{formatStat(player.k9)}</td>
                            <td>{formatStat(player.bb9)}</td>
                            <td>{formatPercent(player.strike_pct)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="stats-section season-inner-card team-total-section">
                  <h2>Team Pitching Totals</h2>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>TEAM</th>
                          <th>IP</th>
                          <th>H</th>
                          <th>OPP AB</th>
                          <th>ER</th>
                          <th>UER</th>
                          <th>BB</th>
                          <th>SO</th>
                          <th>HR</th>
                          <th>HBP</th>
                          <th>PITCHES</th>
                          <th>BALLS</th>
                          <th>STRIKES</th>
                          <th>W</th>
                          <th>L</th>
                          <th>SV</th>
                          <th>ERA</th>
                          <th>WHIP</th>
                          <th>BAA</th>
                          <th>K/BB</th>
                          <th>K/9</th>
                          <th>BB/9</th>
                          <th>STRIKE %</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="team-total-row">
                          <td className="player-name">Cardenales</td>
                          <td>{teamPitchingTotals.ip || '0.0'}</td>
                          <td>{teamPitchingTotals.h ?? 0}</td>
                          <td>{teamPitchingTotals.ab_against ?? 0}</td>
                          <td>{teamPitchingTotals.er ?? 0}</td>
                          <td>{teamPitchingTotals.uer ?? 0}</td>
                          <td>{teamPitchingTotals.bb ?? 0}</td>
                          <td>{teamPitchingTotals.so ?? 0}</td>
                          <td>{teamPitchingTotals.hr ?? 0}</td>
                          <td>{teamPitchingTotals.hbp ?? 0}</td>
                          <td>{teamPitchingTotals.pitches ?? 0}</td>
                          <td>{teamPitchingTotals.balls ?? 0}</td>
                          <td>{teamPitchingTotals.strikes ?? 0}</td>
                          <td>{teamPitchingTotals.w ?? 0}</td>
                          <td>{teamPitchingTotals.l ?? 0}</td>
                          <td>{teamPitchingTotals.sv ?? 0}</td>
                          <td>{formatDecimal2(teamPitchingTotals.era)}</td>
                          <td>{formatDecimal2(teamPitchingTotals.whip)}</td>
                          <td>{formatStat(teamPitchingTotals.baa)}</td>
                          <td>{formatStat(teamPitchingTotals.k_bb)}</td>
                          <td>{formatStat(teamPitchingTotals.k9)}</td>
                          <td>{formatStat(teamPitchingTotals.bb9)}</td>
                          <td>{formatPercent(teamPitchingTotals.strike_pct)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default App