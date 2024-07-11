
import Image from 'next/image';
import bosch from '../assets/Bosch.svg'
import { faBars, faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from 'react';
const Navbar = ({ sideRef }) => {
    const [expanded, setExpanded] = useState(false)
    const handleExpand = () => {
        sideRef.current.style.position = "absolute"
        sideRef.current.style.zIndex = "50"
        sideRef.current.style.height = "100%"
        sideRef.current.style.top = "0"
        sideRef.current.style.left = "0"
        sideRef.current.style.width = "80%"
        sideRef.current.style.background = "white"
        if (expanded) {
            sideRef.current.style.display = "none"
        } else {
            sideRef.current.style.display = "flex"
        }
        setExpanded(!expanded)
    }
    return (
        <div className='flex items-center justify-between p-4 bg-white rounded-xl shadow-xl w-full'>
            <div className="flex gap-4 justify-center items-center">
                <button className='md:hidden' onClick={() => handleExpand()}>
                    {expanded ? (<FontAwesomeIcon icon={faClose} className='text-xl' />) : (<FontAwesomeIcon icon={faBars} className='text-xl' />)}
                </button>
                <Image src={bosch} alt="" className="md:w-40 w-24" />
            </div>
            <div className='flex flex-col'>
                <span className='text-crimson font-bold text-lg md:text-2xl heading' id='heading'>Hey Bosch!</span>
                <span className='subhead text-black text-lg md:text-base font-bold ml-5'><span className='text-[#952432]'>BGSW</span> <span className='text-[#38a3cc]'>Virtual Assistant</span></span>
            </div>
        </div>
    )
}

export default Navbar