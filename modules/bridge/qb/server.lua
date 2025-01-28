
local bridge = {}
local QBCore = exports['qb-core']:GetCoreObject()

--- @param source integer
function bridge.getPlayer(source)
    return QBCore.Functions.GetPlayer(source)
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    local source = source

    OnPlayerLoaded(source)
end)

return bridge