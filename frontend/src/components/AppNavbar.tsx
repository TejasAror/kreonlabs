function AppNavbar( { title } : { title: string}) {
  return (
    <div>
        <div className="w-auto border-b-1 p-2 pl-5">
          <p className="text-xl font-bold">
            {title}
          </p>
        </div>
    </div>
  )
}

export default AppNavbar