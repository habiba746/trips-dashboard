const CHANNEL_COLORS = {
  home: "#4f46e5",
  business: "#059669",
  trader: "#d97706",
};

function colorFor(channel) {
  return CHANNEL_COLORS[channel.toLowerCase()] || "#6b7280";
}

export default function ChannelBreakdown({ channels }) {
  return (
    <div className="channel-grid">
      {Object.entries(channels).map(([channel, count]) => (
        <div className="channel-card" key={channel}>
          <span className="channel-badge" style={{ background: colorFor(channel) }}>
            {channel}
          </span>
          <p className="channel-count">{count}</p>
        </div>
      ))}
    </div>
  );
}