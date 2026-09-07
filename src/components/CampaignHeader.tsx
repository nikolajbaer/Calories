import { useState } from 'react';
import type { Campaign } from '../types';
import { dailyGoal, endCampaign, resumeCampaign } from '../repo';
import { useEndedCampaigns } from '../hooks';
import { formatDisplayDate } from '../date';

interface CampaignHeaderProps {
  campaign: Campaign;
  date: string;
}

export function CampaignHeader({ campaign, date }: CampaignHeaderProps) {
  const [showManage, setShowManage] = useState(false);
  const endedCampaigns = useEndedCampaigns();

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div>
          <h1>{formatDisplayDate(date)}</h1>
          <p className="subdued">
            Target {campaign.targetWeight} lb · Goal {dailyGoal(campaign)} cal/day
          </p>
        </div>
        <button type="button" className="link-button" onClick={() => setShowManage((s) => !s)}>
          Manage campaign
        </button>
      </div>

      {showManage && (
        <div className="manage-panel">
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              if (confirm('End this campaign? You can resume it later.')) {
                await endCampaign(campaign.id);
              }
            }}
          >
            End this campaign
          </button>

          {endedCampaigns && endedCampaigns.length > 0 && (
            <div className="ended-campaigns">
              <h3>Past campaigns</h3>
              <ul>
                {endedCampaigns.map((c) => (
                  <li key={c.id}>
                    <span>
                      {c.startWeight} → {c.targetWeight} lb ({c.startDate} to {c.endDate})
                    </span>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => resumeCampaign(c.id)}
                    >
                      Resume
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
