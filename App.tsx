import React, { useState, useEffect } from 'react';
import { Player, HeroClass, Item, StatType, Location, ItemType, EntityStats, Enemy, GameLog } from '@/types';
import { calculateMaxHp, calculateMaxMana, getClassStats, INITIAL_SHOP_ITEMS, LOCATIONS } from '.ts';
import AdventureScreen from '@/components/AdventureScreen';
import CharacterScreen from '@/components/CharacterScreen';
import InventoryScreen from '@/components/InventoryScreen';
import ShopScreen from '@/components/ShopScreen';
import MapScreen from '@/components/MapScreen';
import TradeScreen from '@/components/TradeScreen';
import ChatScreen from '@/components/ChatScreen';
import { Sword, User, ShoppingBag, Map as MapIcon, Package, Sparkles, ArrowRightLeft, MessageSquare } from 'lucide-react';
import { apiService, TelegramUser } from '@/services/api';

// Initialize default player
const createDefaultPlayer = (hClass: HeroClass): Player => {
  const stats = getClassStats(hClass);
  return {
    name: "Герой",
    heroClass: hClass,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    gold: 50,
    stats,
    statPoints: 0,
    inventory: [],
    pawnedItems: [],
    equipment: { weapon: null, armor: null, pants: null, boots: null },
    currentLocationId: '1',
    loan: null,
    lastUltimateUsed: 0,
    cheekExperience: 0
  };
};

const App: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'adventure' | 'character' | 'inventory' | 'shop' | 'map' | 'trade' | 'chat'>('character');
  const [shopItems, setShopItems] = useState<Item[]>(INITIAL_SHOP_ITEMS);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  
  // Battle State Lifted Up
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
  const [battleLogs, setBattleLogs] = useState<GameLog[]>([]);

  // Telegram WebApp initialization
  useEffect(() => {
    // Check if we're in Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url
        });
        
        // Try to authenticate
        authenticateUser(user);
      }
    } else {
      // For development without Telegram
      console.log('Running in development mode');
      loadLocalPlayer();
    }
  }, []);

  // Load from local storage (fallback)
  const loadLocalPlayer = () => {
    const saved = localStorage.getItem('roguelike_player_v4');
    if (saved) {
      setPlayer(JSON.parse(saved));
    }
  };

  const authenticateUser = async (tgUser: any) => {
    try {
      // First, try to verify existing token
      const verifyResponse = await apiService.verify();
      if (verifyResponse.success) {
        setPlayer(verifyResponse.data?.player as any);
        setIsAuthenticated(true);
        return;
      }
    } catch (error) {
      // Token invalid or expired, need to login
    }

    // If no player selected yet, show class selection
    if (!player) {
      return;
    }

    // Login with Telegram data
    const response = await apiService.login(tgUser, player.heroClass);
    if (response.success && response.data) {
      apiService.setToken(response.data.token);
      setPlayer(response.data.player);
      setIsAuthenticated(true);
    }
  };

  // Save player to server
  const savePlayerToServer = async (playerData: Player) => {
    if (!isAuthenticated || !telegramUser) return;
    
    try {
      await apiService.saveProgress(playerData);
    } catch (error) {
      console.error('Failed to save to server:', error);
      // Fallback to localStorage
      localStorage.setItem('roguelike_player_v4', JSON.stringify(playerData));
    }
  };

  // Sync player changes
  useEffect(() => {
    if (player && isAuthenticated) {
      savePlayerToServer(player);
    } else if (player) {
      localStorage.setItem('roguelike_player_v4', JSON.stringify(player));
    }
  }, [player, isAuthenticated]);

  // Mana Regeneration
  useEffect(() => {
      if (!player) return;
      
      const regenTimer = setInterval(() => {
          setPlayer(current => {
              if (!current) return null;
              if (current.stats.mana >= current.stats.maxMana) return current;
              
              return {
                  ...current,
                  stats: {
                      ...current.stats,
                      mana: Math.min(current.stats.maxMana, current.stats.mana + 1)
                  }
              };
          });
      }, 1000); // 1 mana per second

      return () => clearInterval(regenTimer);
  }, [player?.stats.maxMana]); // Restart only if maxMana changes

  const handleClassSelect = async (hClass: HeroClass) => {
    const newPlayer = createDefaultPlayer(hClass);
    setPlayer(newPlayer);
    
    // If we have Telegram user, try to authenticate
    if (telegramUser) {
      const response = await apiService.login(telegramUser, hClass);
      if (response.success && response.data) {
        apiService.setToken(response.data.token);
        setPlayer(response.data.player);
        setIsAuthenticated(true);
      }
    }
    
    setActiveTab('adventure');
  };

  const showNotification = (msg: string) => {
    setNotifications(prev => [...prev, msg]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  const addBattleLog = (msg: string, type: GameLog['type'] = 'info') => {
    const newLog: GameLog = { id: Date.now().toString(), message: msg, type, timestamp: Date.now() };
    setBattleLogs(prev => [...prev.slice(-20), newLog]);
  };

  const handleStatUpgrade = (stat: StatType) => {
    if (!player || player.statPoints <= 0) return;
    const newStats = { ...player.stats, [stat]: player.stats[stat] + 1 };
    
    if (stat === StatType.VIT) {
        newStats.maxHp = calculateMaxHp(newStats);
        newStats.hp = newStats.hp + 10;
    }
    if (stat === StatType.INT) {
        newStats.maxMana = calculateMaxMana(newStats);
        newStats.mana = newStats.mana + 10;
    }

    setPlayer({
      ...player,
      stats: newStats,
      statPoints: player.statPoints - 1
    });
  };

  const handleEquip = (item: Item) => {
    if (!player) return;
    let slot: 'weapon' | 'armor' | 'pants' | 'boots' = 'weapon';
    
    if (item.type === ItemType.WEAPON) slot = 'weapon';
    else if (item.type === ItemType.ARMOR) slot = 'armor';
    else if (item.type === ItemType.PANTS) slot = 'pants';
    else if (item.type === ItemType.BOOTS) slot = 'boots';
    else return;

    const currentEquip = player.equipment[slot];
    
    let newStats = { ...player.stats };
    
    // Unequip stats
    if (currentEquip && currentEquip.stats) {
      Object.entries(currentEquip.stats).forEach(([key, val]) => {
        // @ts-ignore
        newStats[key] -= val;
      });
    }
    
    // Equip stats
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, val]) => {
        // @ts-ignore
        newStats[key] += val;
      });
    }

    newStats.maxHp = calculateMaxHp(newStats);
    newStats.maxMana = calculateMaxMana(newStats);

    // Remove 1 from inventory
    const newInventory = [...player.inventory];
    const itemIndex = newInventory.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
        if (newInventory[itemIndex].quantity > 1) {
            newInventory[itemIndex].quantity--;
        } else {
            newInventory.splice(itemIndex, 1);
        }
    }

    if (currentEquip) newInventory.push(currentEquip);

    setPlayer({
      ...player,
      inventory: newInventory,
      equipment: { ...player.equipment, [slot]: item },
      stats: newStats
    });
  };

  const handleUnequip = (slot: 'weapon' | 'armor' | 'pants' | 'boots') => {
    if (!player || !player.equipment[slot]) return;
    const item = player.equipment[slot]!;
    
    let newStats = { ...player.stats };
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, val]) => {
        // @ts-ignore
        newStats[key] -= val;
      });
    }
    newStats.maxHp = calculateMaxHp(newStats);
    newStats.maxMana = calculateMaxMana(newStats);

    setPlayer({
      ...player,
      inventory: [...player.inventory, item],
      equipment: { ...player.equipment, [slot]: null },
      stats: newStats
    });
  };

  const handleUseItem = (item: Item) => {
    if (!player || item.type !== ItemType.CONSUMABLE) return;
    
    if (item.healAmount) {
      const newHp = Math.min(player.stats.maxHp, player.stats.hp + item.healAmount);
      
      const newInventory = [...player.inventory];
      const idx = newInventory.findIndex(i => i.id === item.id);
      
      if (idx > -1) {
          if (newInventory[idx].quantity > 1) {
              newInventory[idx].quantity--;
          } else {
              newInventory.splice(idx, 1);
          }
      }

      setPlayer({
        ...player,
        stats: { ...player.stats, hp: newHp },
        inventory: newInventory
      });
      showNotification(`Использован ${item.name}. Здоровье +${item.healAmount}`);
    }
  };

  const handleDropItem = (item: Item) => {
      if (!player) return;
      const newInventory = [...player.inventory];
      const idx = newInventory.findIndex(i => i.id === item.id);
      
      if (idx > -1) {
          if (newInventory[idx].quantity > 1) {
              newInventory[idx].quantity--;
          } else {
              newInventory.splice(idx, 1);
          }
      }
      
      setPlayer({
          ...player,
          inventory: newInventory
      });
      showNotification(`Вы выбросили ${item.name} (1 шт).`);
  };

  const handleBuy = (item: Item) => {
    if (!player || player.gold < item.value) return;
    
    const newInventory = [...player.inventory];
    const existingItem = newInventory.find(i => i.name === item.name && i.type === item.type && i.quantity < i.maxStack);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        newInventory.push({...item, id: Date.now().toString(), quantity: 1}); // Create new instance
    }

    setPlayer({
      ...player,
      gold: player.gold - item.value,
      inventory: newInventory
    });
    showNotification(`Куплен ${item.name}`);
  };

  const handleSell = (item: Item) => {
    if (!player) return;
    const sellValue = Math.floor(item.value / 2);

    const newInventory = [...player.inventory];
    const idx = newInventory.findIndex(i => i.id === item.id);
      
    if (idx > -1) {
        if (newInventory[idx].quantity > 1) {
            newInventory[idx].quantity--;
        } else {
            newInventory.splice(idx, 1);
        }
    }

    setPlayer({
      ...player,
      gold: player.gold + sellValue,
      inventory: newInventory
    });
    showNotification(`Продан ${item.name} за ${sellValue} золота`);
  };

  const handlePawn = (item: Item) => {
      if (!player) return;
      // Get 40% value
      const pawnValue = Math.floor(item.value * 0.4);

      // Remove from inventory
      const newInventory = [...player.inventory];
      const idx = newInventory.findIndex(i => i.id === item.id);
      
      if (idx > -1) {
          if (newInventory[idx].quantity > 1) {
              newInventory[idx].quantity--;
              // If we pawn from a stack, create a single item for pawned list
              const pawnItem = { ...item, quantity: 1, id: Date.now().toString() }; 
              setPlayer(prev => prev ? ({
                  ...prev,
                  gold: prev.gold + pawnValue,
                  inventory: newInventory,
                  pawnedItems: [...prev.pawnedItems, pawnItem]
              }) : null);

          } else {
              const pawnedItem = newInventory.splice(idx, 1)[0];
              setPlayer(prev => prev ? ({
                  ...prev,
                  gold: prev.gold + pawnValue,
                  inventory: newInventory,
                  pawnedItems: [...prev.pawnedItems, pawnedItem]
              }) : null);
          }
      }
      showNotification(`Заложено: ${item.name}. Получено ${pawnValue} золота.`);
  };

  const handleRedeem = (item: Item) => {
      if (!player) return;
      // Redeem cost 50% value (loan was 40%, fee is 10% of base value or 25% of loan)
      const redeemCost = Math.ceil(item.value * 0.5);

      if (player.gold < redeemCost) {
          showNotification("Недостаточно золота для выкупа!");
          return;
      }

      const newPawned = player.pawnedItems.filter(i => i.id !== item.id);
      
      // Add back to inventory
      const newInventory = [...player.inventory];
      const existingItem = newInventory.find(i => i.name === item.name && i.type === item.type && i.quantity < i.maxStack);

      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          newInventory.push(item);
      }

      setPlayer({
          ...player,
          gold: player.gold - redeemCost,
          inventory: newInventory,
          pawnedItems: newPawned
      });
      showNotification(`Выкуплен ${item.name}`);
  }

  const handleTakeLoan = () => {
      if (!player) return;
      if (player.loan) {
          showNotification("У вас уже есть долг!");
          return;
      }
      setPlayer({
          ...player,
          gold: player.gold + 300,
          loan: { amount: 300, battlesRemaining: 3 }
      });
      showNotification("Вы взяли 300 золота в долг.");
  };

  const handleBattleWin = () => {
      if (!player) return;
      
      // Loan Logic
      let newLoan = player.loan;
      let newGold = player.gold;
      
      if (player.loan) {
          newLoan = { ...player.loan, battlesRemaining: player.loan.battlesRemaining - 1 };
          if (newLoan.battlesRemaining <= 0) {
              newGold = newGold - newLoan.amount;
              newLoan = null;
              showNotification(`Время вышло! Ростовщик забрал долг.`);
          }
      }

      // Cheek Experience Healing Passive
      let newHp = player.stats.hp;
      let newMana = player.stats.mana;
      
      if (player.cheekExperience > 0) {
          const healAmount = player.cheekExperience * 5;
          const manaAmount = player.cheekExperience * 2;
          
          newHp = Math.min(player.stats.maxHp, player.stats.hp + healAmount);
          newMana = Math.min(player.stats.maxMana, player.stats.mana + manaAmount);
          
          showNotification(`Опыт защеканства: +${healAmount} HP, +${manaAmount} Mana`);
      }

      setPlayer(prev => prev ? ({
          ...prev,
          gold: newGold,
          loan: newLoan,
          stats: {
              ...prev.stats,
              hp: newHp,
              mana: newMana
          }
      }) : null);
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 text-center">
          INFINITY ROGUE
        </h1>
        <p className="text-gray-400 mb-8 text-center">Бесконечное приключение для подписчиков</p>
        
        <h2 className="text-xl text-white mb-4">Выберите Класс</h2>
        <div className="grid grid-cols-1 w-full gap-4 max-w-md">
          {[HeroClass.WARRIOR, HeroClass.MAGE, HeroClass.HEALER, HeroClass.HATER].map((c) => (
            <button
              key={c}
              onClick={() => handleClassSelect(c)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 p-4 rounded-xl flex items-center justify-between transition-all"
            >
              <span className="font-bold text-lg text-white">{c}</span>
              <Sparkles className="text-yellow-500 opacity-50" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentLocation = LOCATIONS.find(l => l.id === player.currentLocationId) || LOCATIONS[0];

  return (
    <div className="bg-gray-900 min-h-screen h-screen flex flex-col text-gray-100 overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-gray-800 p-2 px-4 shadow-lg z-20 flex justify-between items-center border-b border-gray-700">
        <div className="flex flex-col">
            <span className="font-bold text-sm text-blue-300">{player.name}</span>
            <span className="text-xs text-gray-400">Lvl {player.level} {player.heroClass}</span>
        </div>
        
        {/* Bars */}
        <div className="flex-1 mx-4 max-w-[120px] flex flex-col gap-1">
            {/* Health */}
            <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-600 relative">
                <div 
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }}
                />
            </div>
            {/* Mana */}
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-600 relative">
                <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${(player.stats.mana / player.stats.maxMana) * 100}%` }}
                />
            </div>
        </div>

        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full border border-yellow-900/50">
            <span className={`font-bold text-sm ${player.gold < 0 ? 'text-red-500' : 'text-yellow-400'}`}>{player.gold}</span>
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'adventure' && (
          <AdventureScreen 
            player={player} 
            location={currentLocation} 
            updatePlayer={setPlayer} 
            addLog={addBattleLog}
            enemy={activeEnemy}
            setEnemy={setActiveEnemy}
            logs={battleLogs}
            onBattleWin={handleBattleWin}
          />
        )}
        {activeTab === 'character' && (
          <div className="h-full overflow-y-auto">
            <CharacterScreen player={player} onUpgradeStat={handleStatUpgrade} />
          </div>
        )}
        {activeTab === 'inventory' && (
          <InventoryScreen 
            player={player} 
            onEquip={handleEquip} 
            onUnequip={handleUnequip}
            onUse={handleUseItem}
            onDrop={handleDropItem}
            onSell={handleSell}
            onPawn={handlePawn}
          />
        )}
        {activeTab === 'shop' && (
            <ShopScreen 
                player={player}
                shopInventory={shopItems}
                onBuy={handleBuy}
                onSell={handleSell}
                onTakeLoan={handleTakeLoan}
                onRedeem={handleRedeem}
            />
        )}
        {activeTab === 'trade' && (
            <TradeScreen player={player} updatePlayer={setPlayer} />
        )}
        {activeTab === 'map' && (
            <div className="h-full overflow-y-auto">
                <MapScreen 
                    currentLocationId={player.currentLocationId}
                    onTravel={(loc) => {
                        setPlayer({...player, currentLocationId: loc.id});
                        if (loc.id !== player.currentLocationId) {
                            setActiveEnemy(null);
                            setBattleLogs([]);
                        }
                        setActiveTab('adventure');
                        showNotification(`Путешествие в ${loc.name}...`);
                    }}
                />
            </div>
        )}

        {/* Floating Notifications */}
        <div className="absolute top-4 left-0 right-0 flex flex-col items-center pointer-events-none z-50 space-y-2 px-4">
            {notifications.map((note, idx) => (
                <div key={idx} className="bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm animate-fade-in-up shadow-xl border border-white/10">
                    {note}
                </div>
            ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 border-t border-gray-700 pb-safe z-30">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setActiveTab('character')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'character' ? 'text-blue-400' : 'text-gray-500'}`}>
            <User size={20} />
            <span className="text-[10px]">Герой</span>
          </button>
          
          <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'inventory' ? 'text-blue-400' : 'text-gray-500'}`}>
            <Package size={20} />
            <span className="text-[10px]">Сумка</span>
          </button>
          
          <button onClick={() => setActiveTab('adventure')} className="flex flex-col items-center justify-center -mt-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all ${activeTab === 'adventure' ? 'bg-red-600 border-gray-800 scale-110' : 'bg-gray-700 border-gray-800'}`}>
              <Sword size={24} className="text-white" />
            </div>
            <span className="text-[10px] mt-1 text-gray-400">Битва</span>
          </button>

          <button onClick={() => setActiveTab('trade')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'trade' ? 'text-blue-400' : 'text-gray-500'}`}>
            <ArrowRightLeft size={20} />
            <span className="text-[10px]">Обмен</span>
          </button>

          <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'shop' ? 'text-blue-400' : 'text-gray-500'}`}>
            <ShoppingBag size={20} />
            <span className="text-[10px]">Лавка</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;