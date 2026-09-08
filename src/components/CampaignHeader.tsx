import { useEffect, useRef, useState } from 'react';
import type { Campaign } from '../types';
import { deleteCampaign, endCampaign, resumeCampaign } from '../repo';
import { useEndedCampaigns } from '../hooks';
import { formatShortDate, dayNumber, todayISO } from '../date';
import { formatProjection, projectedDaysToGoal } from '../projection';
import { CampaignEditForm } from './CampaignEditForm';

interface CampaignHeaderProps {
  campaign: Campaign;
  date: string;
  latestWeight: number;
  onNavigate: (deltaDays: number) => void;
  onToday: () => void;
}

export function CampaignHeader({ campaign, date, latestWeight, onNavigate, onToday }: CampaignHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const endedCampaigns = useEndedCampaigns();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const isToday = date === todayISO();
  const daysToGoal = projectedDaysToGoal(latestWeight, campaign.targetWeight, campaign.deficitTarget);

  return (
    <header className="app-header">
      <div className="app-header-line">
        <div className="date-nav">
          <button
            type="button"
            className="nav-arrow"
            aria-label="Previous day"
            disabled={date <= campaign.startDate}
            onClick={() => onNavigate(-1)}
          >
            ‹
          </button>
          <span className="app-header-date-group">
            <span className="app-header-date">{formatShortDate(date)}</span>
            {daysToGoal !== null && (
              <span className="header-projection">({formatProjection(daysToGoal)} left)</span>
            )}
            <span className="app-header-date">· Day {dayNumber(campaign.startDate, date)}</span>
          </span>
          <button
            type="button"
            className="nav-arrow"
            aria-label="Next day"
            disabled={isToday}
            onClick={() => onNavigate(1)}
          >
            ›
          </button>
          {!isToday && (
            <button type="button" className="link-button today-button" onClick={onToday}>
              Today
            </button>
          )}
        </div>
        <div className="menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="menu-trigger"
            aria-label="Campaign menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
              >
                Edit campaign
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  if (confirm('End this campaign? You can resume it later.')) {
                    await endCampaign(campaign.id);
                  }
                }}
              >
                End campaign
              </button>
              <button
                type="button"
                className="danger-item"
                onClick={async () => {
                  setMenuOpen(false);
                  if (
                    confirm(
                      'Delete this campaign and all its logged food, exercise, and weight entries? This cannot be undone.',
                    )
                  ) {
                    await deleteCampaign(campaign.id);
                  }
                }}
              >
                Delete campaign
              </button>
              {endedCampaigns && endedCampaigns.length > 0 && (
                <>
                  <div className="dropdown-divider" />
                  <div className="dropdown-label">Past campaigns</div>
                  {endedCampaigns.map((c) => (
                    <div className="dropdown-row" key={c.id}>
                      <button
                        type="button"
                        className="dropdown-row-main"
                        onClick={() => {
                          setMenuOpen(false);
                          resumeCampaign(c.id);
                        }}
                      >
                        {c.startWeight} → {c.targetWeight} lb ({c.startDate} to {c.endDate})
                      </button>
                      <button
                        type="button"
                        className="row-icon-button"
                        aria-label="Delete this campaign"
                        onClick={async () => {
                          if (
                            confirm(
                              'Delete this campaign and all its logged food, exercise, and weight entries? This cannot be undone.',
                            )
                          ) {
                            await deleteCampaign(c.id);
                          }
                        }}
                      >
                        ⛔
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {editing && <CampaignEditForm campaign={campaign} onDone={() => setEditing(false)} />}
    </header>
  );
}
