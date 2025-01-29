lib.versionCheck('Peak-Scripts/peak_scoreboard')

local config = lib.load('config')
local sessionTime = {}

---@param playerId integer
local function isPlayerAdmin(playerId)
    return IsPlayerAceAllowed(playerId, 'command')
end

---@param players table
local function getJobCounts(players)
    local jobCounts = {}

    for _, jobInfo in ipairs(config.trackedJobs) do
        jobCounts[jobInfo.name:lower()] = 0
    end

    for _, player in ipairs(players) do
        if player.onduty and jobCounts[player.job:lower()] ~= nil then
            jobCounts[player.job:lower()] = jobCounts[player.job:lower()] + 1
        end
    end

    return jobCounts
end

---@param seconds number
local function formatSessionTime(seconds)
    local hours = math.floor(seconds / 3600)
    local minutes = math.floor((seconds % 3600) / 60)
    
    if hours > 0 then
        return ('%dh %dm'):format(hours, minutes)
    else
        return ('%dm'):format(minutes)
    end
end

---@param playerId integer
local function getPlayerSessionTime(playerId)
    local currentTime = os.time()
    
    if not sessionTime[playerId] then
        sessionTime[playerId] = currentTime
    end
    
    local sessionDuration = currentTime - sessionTime[playerId]
    return formatSessionTime(sessionDuration)
end

---@param playerId integer
function OnPlayerLoaded(playerId)
    sessionTime[playerId] = os.time()
end

lib.callback.register('peak_scoreboard:server:getData', function()
    local players = {}
    local adminCache = {}
    local trackedJobs = {}
    
    local source = source
    local player = bridge.getPlayer(source)

    if not player then return end

    for _, playerId in ipairs(GetPlayers()) do
        adminCache[playerId] = isPlayerAdmin(tonumber(playerId))
    end

    for _, playerId in ipairs(GetPlayers()) do
        local player = bridge.getPlayer(tonumber(playerId))

        if not player then return end

        local playerName
        if config.useSteamNames then
            playerName = GetPlayerName(playerId)
        else
            playerName = ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
        end

        table.insert(players, {
            id = playerId,
            name = playerName,
            job = player.PlayerData.job.name,
            onduty = player.PlayerData.job.onduty,
            isAdmin = adminCache[playerId],
            ping = GetPlayerPing(playerId)
        })
    end

    local playerData = {
        id = source,
        name = config.useSteamNamesForCurrentPlayer and GetPlayerName(source) or config.useSteamNames and GetPlayerName(source) or ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname),
        job = player.PlayerData.job.name,
        onduty = player.PlayerData.job.onduty,
        isAdmin = adminCache[tostring(source)],
        playTime = getPlayerSessionTime(tostring(source))
    }

    for _, jobInfo in ipairs(config.trackedJobs) do
        table.insert(trackedJobs, {
            name = jobInfo.name,
            label = jobInfo.label,
            icon = jobInfo.icon,
            color = jobInfo.color
        })
    end

    local serverData = {
        players = players,
        serverInfo = {
            name = config.serverInfo.name,
            logo = config.serverInfo.logo,
            maxPlayers = GetConvarInt('sv_maxclients', 64),
            trackedJobs = trackedJobs,
            showJobCards = config.scoreboard.jobCards.enabled == true,
            showAdminTags = config.scoreboard.adminBadges.enabled == true,
            showJobDisplay = config.scoreboard.jobBadges.enabled == true,
            jobCounts = getJobCounts(players)
        },
        currentPlayer = playerData
    }

    return serverData
end)
