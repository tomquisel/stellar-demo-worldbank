export default function truncateAddress(addr: string): string {
  return addr.substring(0, 5) + "..." + addr.substring(51, 56);
}
