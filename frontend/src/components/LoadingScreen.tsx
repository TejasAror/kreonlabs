import LoadingIcons from 'react-loading-icons'

function LoadingScreen({text} : { text: null | string}) {
  return (

    <div className='mt-10'>
        
        <div className="w-[100%] flex justify-center p-5">
          <p className="text-3xl font-bold">{text}</p>
        </div>
        
        <div className="w-[100%] flex justify-center p-2">
          <p className='text-accent-foreground'>Almost there. Pixels need patience too.</p>  
        </div>

        <div className="w-[100%] flex justify-center p-10">
          <LoadingIcons.Puff />
        </div>

    </div>


  )
}

export default LoadingScreen