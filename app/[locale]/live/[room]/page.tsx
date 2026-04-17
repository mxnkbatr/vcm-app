import LiveRoomClient from "./LiveRoomClient";

export default async function LiveRoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  return <LiveRoomClient room={room} />;
}

