import { ArrowLeft, Clock, DollarSign, TrendingDown, Users, Shield, Zap, Calendar } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function SmartInsights({ onBack }: Props) {
  const insights = [
    {
      id: 1,
      icon: DollarSign,
      title: 'Wait 20 min to save $8',
      description: 'Metro crowd will decrease by 40% and rideshare surge pricing will drop from 2.1x to 1.0x',
      impact: 'Save $8.00',
      time: 'Leaves at 3:20 PM',
      color: '#91A889',
      bgColor: 'bg-[#91A889]',
      badge: 'Recommended',
    },
    {
      id: 2,
      icon: Clock,
      title: 'Depart now for fastest route',
      description: 'Current traffic is 15% lighter than usual. Expected to increase in 25 minutes during rush hour.',
      impact: '10 min faster',
      time: 'Leave now',
      color: '#0099D8',
      bgColor: 'bg-[#0099D8]',
      badge: 'Time Saver',
    },
    {
      id: 3,
      icon: Users,
      title: 'High crowd level detected',
      description: 'Lakers game ending soon. Metro Red Line will be 60% more crowded than normal between 9–10 PM.',
      impact: 'Very Crowded',
      time: 'Next 2 hours',
      color: '#E95A2B',
      bgColor: 'bg-[#E95A2B]',
      badge: 'Crowd Alert',
    },
    {
      id: 4,
      icon: Shield,
      title: 'Safer route available',
      description: 'Alternative route through well-lit areas with higher foot traffic. Only adds 5 minutes.',
      impact: '+5 min',
      time: 'Recommended',
      color: '#E91C77',
      bgColor: 'bg-[#E91C77]',
      badge: 'Safety First',
    },
  ];

  const predictions = [
    { time: 'Now',     traffic: 'Low',  price: '$12.50', crowd: 'Medium', trafficLevel: 30, priceLevel: 50, crowdLevel: 60 },
    { time: '3:20 PM', traffic: 'Low',  price: '$4.50',  crowd: 'Low',    trafficLevel: 25, priceLevel: 20, crowdLevel: 30 },
    { time: '5:00 PM', traffic: 'High', price: '$18.00', crowd: 'High',   trafficLevel: 90, priceLevel: 85, crowdLevel: 85 },
  ];

  return (
    <div className="h-full w-full bg-white overflow-auto">
      <div className="sticky top-0 z-20 bg-[#E91C77] text-white">
        <div className="px-6 py-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5" />
              <h1 className="text-xl font-bold">AI Smart Insights</h1>
            </div>
            <p className="text-sm text-pink-100">Real-time predictions to optimize your journey</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Personalized Recommendations</h2>
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="rounded-3xl p-5 border-2 border-gray-200 shadow-lg bg-white">
              <div className="flex items-start gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${insight.bgColor}/10`}>
                  <Icon className="w-6 h-6" style={{ color: insight.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{insight.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${insight.bgColor}/10`}
                      style={{ color: insight.color }}
                    >
                      {insight.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900">{insight.impact}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">{insight.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className={`w-full py-2.5 ${insight.bgColor} text-white rounded-xl font-medium text-sm shadow-sm active:scale-95 transition-transform`}>
                Apply This Insight
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-6 pb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Predictive Timeline</h2>
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#E91C77]" />
            <span className="text-sm font-semibold text-gray-900">Traffic &amp; Pricing Forecast</span>
          </div>
          <div className="space-y-4">
            {predictions.map((pred, idx) => (
              <div key={idx} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">{pred.time}</span>
                  <span className="text-sm font-semibold text-[#91A889]">{pred.price}</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Traffic', value: pred.traffic, level: pred.trafficLevel, bar: 'bg-[#E95A2B]' },
                    { label: 'Price',   value: pred.price,   level: pred.priceLevel,   bar: 'bg-[#91A889]' },
                    { label: 'Crowd',   value: pred.crowd,   level: pred.crowdLevel,   bar: 'bg-[#E91C77]' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{row.label}</span>
                        <span className="text-xs font-medium text-gray-700">{row.value}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${row.bar}`} style={{ width: `${row.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
