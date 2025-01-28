import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { fetchNui } from '../utils/fetchNui';
import { CSSTransition } from 'react-transition-group';
import { useVisibility } from '../providers/VisibilityProvider';

interface Player {
  id: number;
  name: string;
  ping: number;
  job: string;
  onduty?: boolean;
  isAdmin?: boolean;
  avatar?: string;
  playTime?: string;
}

interface JobInfo {
  name: string;
  label: string;
  icon: string;
  color: string;
}

interface ServerInfo {
  name: string;
  logo: string;
  maxPlayers: number;
  jobCounts: Record<string, number>;
  trackedJobs: JobInfo[];
  showJobCards?: boolean;
  showAdminTags?: boolean;
  showJobDisplay?: boolean;
}

interface ScoreboardData {
  players: Player[];
  serverInfo: ServerInfo;
  currentPlayer: Player | null;
}

const JobCard = ({ job, count, info }: { job: string; count: number; info: JobInfo }) => {
  const isZeroCount = count === 0;
  
  return (
    <div 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-border/30 transition-colors duration-200 ${
        isZeroCount 
          ? 'opacity-50 cursor-not-allowed hover:bg-transparent' 
          : 'hover:bg-accent/20'
      }`}
      style={{ 
        backgroundColor: info.color ? `${info.color}10` : 'transparent',
        borderColor: info.color ? `${info.color}30` : undefined
      }}
      title={isZeroCount ? 'No players on duty' : `${count} players on duty`}
    >
      {info.icon ? (
        <div 
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ 
            backgroundColor: info.color ? `${info.color}20` : 'transparent',
            color: info.color || 'currentColor'
          }}
        >
          {typeof info.icon === 'string' ? (
            <span className="text-lg">{info.icon}</span>
          ) : (
            info.icon
          )}
        </div>
      ) : (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-sm font-medium">{job.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium capitalize ${
            isZeroCount ? 'text-muted-foreground' : 'text-card-foreground'
          }`}>
            {job.replace('_', ' ')}
          </span>
          <span 
            className={`text-xs font-semibold rounded px-2 py-0.5 ${
              isZeroCount ? 'bg-muted/20 text-muted-foreground' : ''
            }`}
            style={{ 
              backgroundColor: info.color ? `${info.color}30` : 'transparent',
              color: info.color || 'currentColor'
            }}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

const JobDisplay = ({ job, jobInfo, isOnDuty }: { job: string; jobInfo?: JobInfo; isOnDuty: boolean }) => {
  const jobColor = jobInfo?.color || '#6b7280';
  
  return (
    <div 
      className={`inline-flex items-center rounded-md px-1.5 ${isOnDuty ? '' : 'opacity-75'}`}
      style={{ 
        backgroundColor: `${jobColor}15`,
        border: `1px solid ${jobColor}30`,
        paddingTop: '0.15rem',
        paddingBottom: '0.15rem'
      }}
    >
      {jobInfo?.icon && (
        <span className="mr-1 text-sm flex items-center">{jobInfo.icon}</span>
      )}
      <span 
        className="text-[11px] font-medium capitalize flex items-center"
        style={{ color: jobColor }}
      >
        {jobInfo?.label || job}
        {!isOnDuty && <span className="ml-1 opacity-75">(Off Duty)</span>}
      </span>
    </div>
  );
};

const PlayerCard = ({ player, serverInfo }: { player: Player, serverInfo: ScoreboardData['serverInfo'] }) => {
  const jobInfo = serverInfo.trackedJobs.find((job) => job.name === player.job);
  const showAdminTags = serverInfo.showAdminTags === true;
  const isOnDuty = player.onduty !== undefined ? player.onduty : true;
  const showJobDisplay = serverInfo.showJobDisplay !== false;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-background/40 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {player.avatar ? (
          <img src={player.avatar} alt="Avatar" className="h-7 w-7 rounded-full flex-shrink-0" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary flex-shrink-0">
            <span className="text-xs font-medium text-primary-foreground">#{player.id}</span>
          </div>
        )}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <p 
            className={`font-medium text-[13px] leading-none truncate ${player.isAdmin && showAdminTags ? '' : 'text-card-foreground'}`}
            style={player.isAdmin && showAdminTags ? { color: 'gold' } : {}}
          >
            {player.name}
          </p>
          {player.isAdmin && showAdminTags && (
            <span 
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{ 
                backgroundColor: 'rgba(218, 165, 32, 0.3)', 
                color: 'gold',
                height: '1.25rem',  
                lineHeight: '1rem'  
              }}
            >
                ⭐ Admin
              </span>
          )}
          {showJobDisplay && (
            <div className="flex-shrink-0 flex items-center">
              <JobDisplay job={player.job} jobInfo={jobInfo} isOnDuty={isOnDuty} />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center ml-2">
        <div className="text-xs">
          <span className={player.ping < 100 ? 'text-green-400' : player.ping < 200 ? 'text-yellow-400' : 'text-red-400'}>
            {player.ping}ms
          </span>
        </div>
      </div>
    </div>
  );
};

const CurrentPlayerInfo = ({ player, serverInfo }: { 
  player: NonNullable<ScoreboardData['currentPlayer']>, 
  serverInfo: ScoreboardData['serverInfo'] 
}) => {
  const showAdminTags = serverInfo.showAdminTags === true;
  const jobInfo = serverInfo.trackedJobs.find((job) => job.name === player.job);
  const isOnDuty = player.onduty !== undefined ? player.onduty : true;
  const showJobDisplay = serverInfo.showJobDisplay !== false;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-background/40 w-[400px]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {player.avatar ? (
          <img src={player.avatar} alt="Avatar" className="h-7 w-7 rounded-full flex-shrink-0" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary flex-shrink-0">
            <span className="text-xs font-medium text-primary-foreground">#{player.id}</span>
          </div>
        )}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <p 
            className={`font-medium text-[13px] leading-none truncate ${player.isAdmin && showAdminTags ? '' : 'text-card-foreground'}`}
            style={player.isAdmin && showAdminTags ? { color: 'gold' } : {}}
          >
            {player.name}
          </p>
          {player.isAdmin && showAdminTags && (
            <span 
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{ 
                backgroundColor: 'rgba(218, 165, 32, 0.3)', 
                color: 'gold',
                height: '1.25rem',  
                lineHeight: '1rem'  
              }}
            >
                ⭐ Admin
              </span>
          )}
          {showJobDisplay && (
            <div className="flex-shrink-0 flex items-center">
              <JobDisplay job={player.job} jobInfo={jobInfo} isOnDuty={isOnDuty} />
            </div>
          )}
        </div>
      </div>
      <div className="text-xs ml-2 flex-shrink-0">
        <span className="text-muted-foreground">Session Time:</span>
        <span className="ml-1 text-card-foreground">{player.playTime}</span>
      </div>
    </div>
  );
};

export const Scoreboard = () => {
  const [data, setData] = useState<ScoreboardData | null>(null);
  const nodeRef = useRef(null);
  const { visible } = useVisibility();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchNui<ScoreboardData>('getData');
        
        const processedResponse = {
          ...response,
          serverInfo: {
            ...response?.serverInfo,
            showJobCards: response?.serverInfo?.showJobCards === true ? true : false,
            showAdminTags: response?.serverInfo?.showAdminTags === true ? true : false,
            showJobDisplay: response?.serverInfo?.showJobDisplay !== false
          }
        };

        if (processedResponse && processedResponse.players && processedResponse.players.length > 0) {
          setData(processedResponse);
        } else {
        }
      } catch (error) {
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible]);

  useNuiEvent<ScoreboardData>('updateData', (newData) => {
    const processedData = {
      ...newData,
      serverInfo: {
        ...newData.serverInfo,
        showJobCards: newData.serverInfo?.showJobCards === true ? true : false,
        showAdminTags: newData.serverInfo?.showAdminTags === true ? true : false,
        showJobDisplay: newData.serverInfo?.showJobDisplay !== false
      }
    };

    if (processedData.players && processedData.players.length > 0) {
      setData(processedData);
    } else {
    }
  });

  useNuiEvent<boolean>('setVisible', (show) => {
  });

  if (!data) {
    return null;
  }

  return (
    <CSSTransition
      in={visible}
      timeout={300}
      classNames="fade"
      unmountOnExit
      nodeRef={nodeRef}
      appear
    >
      <div ref={nodeRef} className="w-[1200px] relative">
        <div className="scoreboard-mask">
          <div className="absolute inset-0 bg-[#040d1a]/95" />
          <div className="absolute inset-0 bg-[#071426]/90" />
          <div className="absolute inset-0 backdrop-blur-md" />
          <div className="absolute inset-0 rounded-lg border border-border pointer-events-none" />
          <div className="relative">
            <div className="p-6 pb-2 border-b border-border/50 relative">
              <div className="flex items-center mb-5">
                <div className="flex items-center gap-5">
                  <img src={data.serverInfo.logo} alt="Server Logo" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground tracking-tight">{data.serverInfo.name}</h2>
                    <p className="text-muted-foreground">
                      {data.players.length} / {data.serverInfo.maxPlayers} Players Online
                    </p>
                  </div>
                </div>
              </div>
              {data.currentPlayer ? (
                <div className="absolute top-6 right-6">
                  <CurrentPlayerInfo player={data.currentPlayer} serverInfo={data.serverInfo} />
                </div>
              ) : (
                <div className="absolute top-6 right-6 text-red-400">No current player data</div>
              )}
              {data.serverInfo.showJobCards && (
                <div className="grid grid-cols-4 gap-3 mb-1">
                  {data.serverInfo.trackedJobs.map((jobInfo) => {
                    const count = data.serverInfo.jobCounts[jobInfo.name] || 0;
                    
                    return (
                      <JobCard 
                        key={jobInfo.name} 
                        job={jobInfo.label || jobInfo.name} 
                        count={count} 
                        info={jobInfo} 
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <ScrollArea className="h-[400px] p-6 pt-3">
              <div className="grid grid-cols-2 gap-3">
                {data.players.map((player) => (
                  <PlayerCard key={player.id} player={player} serverInfo={data.serverInfo} />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};
