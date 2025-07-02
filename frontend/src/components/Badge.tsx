function Badge({
    title,
    color
}: {
    title: string,
    color: string
}) {
  return (
    <div className={`bg-[${color}] rounded-xl border-1`}>
        {title}
    </div>
  )
}

export default Badge