local bridge = {}

--- @param source integer
function bridge.getPlayer(source)
    return exports.qbx_core:GetPlayer(source)
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    local source = source 
    
    OnPlayerLoaded(source)
end)

return bridge