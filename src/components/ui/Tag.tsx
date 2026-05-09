export default function Tag({ TagText }: { TagText: string }) {
  return (
    <div className="absolute top-3 right-3 rounded-full bg-pink-400 px-1.5 py-1 text-xs font-bold text-white">
      {TagText}
    </div>
  )
}
