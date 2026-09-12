/**
 * 睡眠定时器选择面板。
 * 预设 15/30/45/60 分钟快捷按钮 + 手动输入分钟数 + 确定/取消。
 * 桌面端（PlayerTools popover）与移动端（MobilePlayerMenu 子项）共用。
 */

import { useState } from 'react'
import { usePlayerStore } from '@/lib/store/player-store'

const PRESETS = [15, 30, 45, 60]

interface Props {
  onClose: () => void
}

export function SleepTimerPicker({ onClose }: Props) {
  const sleepTimer = usePlayerStore(s => s.sleepTimer)
  const setSleepTimer = usePlayerStore(s => s.setSleepTimer)
  const [custom, setCustom] = useState('')

  const apply = (minutes: number | null) => {
    setSleepTimer(minutes)
    onClose()
  }

  const handleCustomSubmit = () => {
    const n = parseInt(custom, 10)
    if (Number.isFinite(n) && n > 0) {
      apply(n)
    }
  }

  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => apply(m)}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              sleepTimer?.minutes === m
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/40 text-foreground hover:bg-accent'
            }`}
          >
            {m} 分钟
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={999}
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCustomSubmit() }}
          placeholder="自定义"
          className="w-full rounded-md bg-background px-2.5 py-2 text-xs outline-none ring-1 ring-border focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleCustomSubmit}
          disabled={!custom || parseInt(custom, 10) <= 0}
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          确定
        </button>
      </div>
      {sleepTimer && (
        <button
          type="button"
          onClick={() => apply(null)}
          className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          取消定时
        </button>
      )}
    </div>
  )
}