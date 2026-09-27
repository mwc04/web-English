const LearningSession = require('../models/LearningSession');
const User = require('../models/User');

const COMPLETED_SECONDS_THRESHOLD = 60;
const HEARTBEAT_MAX_DELTA_SECONDS = 90;
const MAX_SESSION_SECONDS = 3600;

async function updateUserStats(userId, skill, minutes) {
  const user = await User.findById(userId);
  if (!user) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = user.lastLearningDate ? new Date(user.lastLearningDate) : null;
  let streak = user.streakDays || 0;
  if (lastDate) {
    const lastDateOnly = new Date(lastDate);
    lastDateOnly.setHours(0, 0, 0, 0);
    const diff = Math.round((today - lastDateOnly) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak += 1;
    else if (diff > 1) streak = 1;
  } else {
    streak = 1;
  }
  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalLearningMinutes: minutes,
      [`learningStats.${skill}.minutes`]: minutes,
      [`learningStats.${skill}.sessions`]: 1
    },
    $set: {
      lastActiveAt: new Date(),
      lastLearningDate: new Date(),
      streakDays: streak
    }
  });
}

function computeSkillStats(learningStats) {
  const skills = ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing'];
  return skills.map((skill) => {
    const stats = (learningStats && learningStats[skill]) || { minutes: 0, sessions: 0 };
    return {
      skill,
      minutes: stats.minutes || 0,
      sessions: stats.sessions || 0,
      percent: 0
    };
  });
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sessionSeconds(s) {
  return s.activeSeconds || s.durationSeconds || 0;
}

async function getWeekSessions(userId) {
  const monday = getMonday(new Date());
  return LearningSession.find({
    user: userId,
    isActive: false,
    endedAt: { $gte: monday }
  });
}

async function getTodayMinutes(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const sessions = await LearningSession.find({
    user: userId,
    isActive: false,
    endedAt: { $gte: start }
  });
  const seconds = sessions.reduce((sum, s) => sum + sessionSeconds(s), 0);
  return Math.floor(seconds / 60);
}

async function getWeeklyMinutes(userId) {
  const sessions = await getWeekSessions(userId);
  const seconds = sessions.reduce((sum, s) => sum + sessionSeconds(s), 0);
  return Math.floor(seconds / 60);
}

function calculateStreak(user) {
  return (user && user.streakDays) || 0;
}

function buildWeekChart(weekSessions) {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const secondsByDay = [0, 0, 0, 0, 0, 0, 0];
  weekSessions.forEach((s) => {
    if (!s.endedAt) return;
    const d = new Date(s.endedAt).getDay();
    const idx = d === 0 ? 6 : d - 1;
    secondsByDay[idx] += sessionSeconds(s);
  });
  return days.map((label, idx) => {
    const isToday = idx === todayIdx;
    const isFuture = idx > todayIdx;
    const minutes = isFuture ? 0 : Math.floor(secondsByDay[idx] / 60);
    return {
      label,
      minutes,
      percent: Math.min(100, Math.round((minutes / 60) * 100)),
      isToday,
      isFuture
    };
  });
}

function generateActivityChartData(user, weekSessions) {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  if (!user || !user.totalLearningMinutes || user.totalLearningMinutes === 0) {
    return days.map((label) => ({ label, minutes: 0, percent: 0, isToday: false, isFuture: false }));
  }
  return buildWeekChart(weekSessions || []);
}

function buildAchievements({ completedLessons, streakDays, learningStats }) {
  const vocabMinutes = (learningStats && learningStats.vocabulary && learningStats.vocabulary.minutes) || 0;
  const grammarSessions = (learningStats && learningStats.grammar && learningStats.grammar.sessions) || 0;
  const listeningMinutes = (learningStats && learningStats.listening && learningStats.listening.minutes) || 0;
  const readingSessions = (learningStats && learningStats.reading && learningStats.reading.sessions) || 0;
  const defs = [
    { title: 'Người mới bắt đầu', description: 'Hoàn thành 5 bài học đầu tiên', icon: '🌱', bgColor: '#22c55e20', target: 5, current: completedLessons },
    { title: 'Người chăm chỉ', description: 'Học liên tục 7 ngày', icon: '🔥', bgColor: '#f59e0b20', target: 7, current: Math.min(streakDays, 7) },
    { title: 'Bậc thầy từ vựng', description: 'Học 100 phút từ vựng', icon: '📝', bgColor: '#22c55e20', target: 100, current: Math.min(vocabMinutes, 100) },
    { title: 'Ngữ pháp master', description: 'Hoàn thành 20 phiên ngữ pháp', icon: '📚', bgColor: '#7c3aed20', target: 20, current: Math.min(grammarSessions, 20) },
    { title: 'Thần thánh nghe', description: 'Luyện nghe 10 giờ', icon: '🎧', bgColor: '#3b82f620', target: 10, current: Math.min(Math.floor(listeningMinutes / 60), 10) },
    { title: 'Thần tốc đọc', description: 'Hoàn thành 50 phiên đọc', icon: '📖', bgColor: '#f59e0b20', target: 50, current: Math.min(readingSessions, 50) },
  ];
  return defs.map((a) => ({
    title: a.title,
    description: a.description,
    icon: a.icon,
    bgColor: a.bgColor,
    unlocked: a.current >= a.target,
    progress: a.current,
    target: a.target
  }));
}

exports.startSession = async (req, res) => {
  try {
    const { skill, lessonId, lessonTitle } = req.body;
    const activeSession = await LearningSession.findOne({ user: req.user.id, isActive: true });
    if (activeSession) {
      return res.json({ success: true, data: activeSession, message: 'Session dang chay' });
    }
    const now = new Date();
    const session = await LearningSession.create({
      user: req.user.id,
      skill,
      lessonId,
      lessonTitle,
      startedAt: now,
      lastPingAt: now,
      activeSeconds: 0,
      isActive: true
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.heartbeatSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await LearningSession.findOne({ _id: sessionId, user: req.user.id, isActive: true });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Khong co session hoat dong' });
    }
    const now = new Date();
    const base = session.lastPingAt ? new Date(session.lastPingAt) : new Date(session.startedAt);
    let delta = Math.floor((now - base) / 1000);
    if (delta < 0) delta = 0;
    if (delta > HEARTBEAT_MAX_DELTA_SECONDS) delta = HEARTBEAT_MAX_DELTA_SECONDS;
    session.activeSeconds = Math.min(MAX_SESSION_SECONDS, (session.activeSeconds || 0) + delta);
    session.lastPingAt = now;
    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { skill, activeSeconds, duration } = req.body;
    const activeSession = await LearningSession.findOne({ user: req.user.id, isActive: true });
    if (!activeSession) {
      return res.json({ success: false, message: 'Khong co session hoat dong' });
    }
    const now = new Date();
    let seconds = activeSeconds != null ? activeSeconds : duration;
    if (seconds == null) {
      const base = activeSession.lastPingAt ? new Date(activeSession.lastPingAt) : new Date(activeSession.startedAt);
      seconds = (activeSession.activeSeconds || 0) + Math.max(0, Math.floor((now - base) / 1000));
    }
    seconds = Math.min(MAX_SESSION_SECONDS, Math.max(0, Math.floor(seconds)));
    activeSession.isActive = false;
    activeSession.endedAt = now;
    activeSession.durationSeconds = seconds;
    activeSession.activeSeconds = seconds;
    await activeSession.save();
    const minutes = Math.floor(seconds / 60);
    await updateUserStats(req.user.id, skill || activeSession.skill, minutes);
    res.json({ success: true, data: activeSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLearningStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
    }
    const skillStats = computeSkillStats(user.learningStats || {});
    const recentSessions = await LearningSession.find({ user: userId, isActive: false })
      .sort({ startedAt: -1 })
      .limit(10);
    const weekSessions = await getWeekSessions(userId);
    const activityChartData = generateActivityChartData(user, weekSessions);
    const todayMinutes = await getTodayMinutes(userId);
    const weeklyMinutes = await getWeeklyMinutes(userId);
    const completedLessonIds = new Set();
    const allLessonIds = new Set();
    const endedWithLesson = await LearningSession.find(
      { user: userId, isActive: false, lessonId: { $exists: true, $ne: null } },
      { lessonId: 1, activeSeconds: 1, durationSeconds: 1 }
    );
    endedWithLesson.forEach((s) => {
      if (!s.lessonId) return;
      allLessonIds.add(String(s.lessonId));
      if (sessionSeconds(s) >= COMPLETED_SECONDS_THRESHOLD) {
        completedLessonIds.add(String(s.lessonId));
      }
    });
    const completedLessons = completedLessonIds.size;
    const totalLessons = allLessonIds.size;
    const achievements = buildAchievements({
      completedLessons,
      streakDays: calculateStreak(user),
      learningStats: user.learningStats || {}
    });
    res.json({
      success: true,
      data: {
        totalMinutes: user.totalLearningMinutes || 0,
        streakDays: calculateStreak(user),
        todayMinutes,
        weeklyMinutes,
        avgDailyMinutes: Math.round(weeklyMinutes / 7),
        skillStats,
        recentSessions: recentSessions.slice(-10),
        activityChartData,
        completedLessons,
        totalLessons,
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLearningSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { skill } = req.query;
    const query = { user: req.user.id, isActive: false };
    if (skill) query.skill = skill;
    const sessions = await LearningSession.find(query)
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await LearningSession.countDocuments(query);
    res.json({
      success: true,
      data: sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
