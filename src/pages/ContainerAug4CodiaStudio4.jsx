import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import GamePlayScreen from "@/components/game/GamePlayScreen";

export default function ContainerAug4CodiaStudio4() {
  const { gameId } = useParams();
  const [params] = useSearchParams();
  const tier = params.get("tier");
  const variantId = params.get("g");
  return <GamePlayScreen gameId={gameId} tier={tier} variantId={variantId} />;
}