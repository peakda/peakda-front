import CategoryChip from './CategoryChip'

const CATEGORY_LIST = ['전체', '명소', '동네']

export default function Category() {
  return (
    <div className="bg-bg-primary-80 border-border-primary shadow-background flex gap-2 rounded-full border p-1">
      {CATEGORY_LIST.map((cate) => (
        <CategoryChip label={cate} key={cate} selected="전체" />
      ))}
    </div>
  )
}
