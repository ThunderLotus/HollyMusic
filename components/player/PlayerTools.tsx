/**
 * 桌面端播放栏右侧工具区（替代旧 VolumeControl）。
 *
 * 关键改动：容器不再 `hidden md:flex`——功能入口（歌词/队列/定时器）始终可见。
 * 歌词/队列用 showLabel 显示文字（高频入口，解决「猜」）；定时器/静音纯图标 + title。
 */

import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/lib/store/player-store'
import { ProgressBar } from './ProgressBar'
import { PlayerButton } from './PlayerButton'
import { SleepTimerPicker } from './SleepTimerPicker'
import { Mic2, ListMusic, Timer, Volume2, VolumeX } from 'lucide-react'

export function PlayerTools() {
  const volume = usePlayerStore(s => s.volume)
  const isMuted = usePlayerStore(s => s.isMuted)
  const setVolume = usePlayerStore(s => s.setVolume)
  const toggleMute = usePlayerStore(s => s.toggleMute)
  const toggleQueue = usePlayerStore(s => s.toggleQueue)
  const toggleLyrics = usePlayerStore(s => s.toggleLyrics)
  const sleepTimer = usePlayerStore(s => s.sleepTimer)

  const [timerOpen, setTimerOpen] = useState(false)
  const timerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!timerOpen) return
    const onDown = (e: MouseEvent) => {
      if (timerRef.current && !timerRef.current.contains(e.target as Node)) setTimerOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [timerOpen])

  const VolIcon = isMuted || volume === 0 ? VolumeX : Volume2

  return (
    <div className="hidden items-center justify-end gap-1 md:flex md:w-[30%]">
      <PlayerButton icon={Mic2} label="歌词" onClick={toggleLyrics} showLabel />
      <PlayerButton icon={ListMusic} label="队列" onClick={toggleQueue} showLabel />
      <div className="relative" ref={timerRef}>
        <PlayerButton
          icon={Timer}
          label={sleepTimer ? `定时关闭：${sleepTimer.minutes} 分钟后暂停` : '定时关闭'}
          onClick={() => setTimerOpen(v => !v)}
          active={!!sleepTimer || timerOpen}
        />
        {timerOpen && (
          <div className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-md border border-border bg-popover p-2 shadow-lg">
            <SleepTimerPicker onClose={() => setTimerOpen(false)} />
          </div>
        )}
      </div>
      <PlayerButton
        icon={VolIcon}
        label={isMuted ? '取消静音' : '静音'}
        onClick={toggleMute}
        active={isMuted}
      />
      <div className="w-24">
        <ProgressBar value={isMuted ? 0 : volume * 100} onChange={pct => setVolume(pct / 100)} />
      </div>
    </div>
  )
}
