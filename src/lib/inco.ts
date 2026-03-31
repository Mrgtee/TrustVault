import { Lightning } from "@inco/js/lite";
import { CHAIN_ID } from "@/constants";

let lightningInstance: Awaited<ReturnType<typeof Lightning.latest>> | null =
  null;

export async function getIncoClient() {
  if (!lightningInstance) {
    lightningInstance = await Lightning.latest("testnet", CHAIN_ID);
  }
  return lightningInstance;
}
