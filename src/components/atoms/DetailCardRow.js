export default function DetailCardRow({ label, value }) {
  return (
    <div className="flex">
      <div className="w-[100px] text-[12px] text-[#535353]">{label}</div>
      <div className="flex-1 text-[12px] font-bold text-[#000]">{value}</div>
    </div>
  );
}