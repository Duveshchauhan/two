const Loader = () => {
    return (
        <div className="flex justify-center items-center h-screen fixed top-0 left-0 w-full z-[9999] backdrop-filter backdrop-blur-sm flex-col text-white gap-3 text-xl">
            <div className="loader"></div>
            Loading assistant.....
            <br/><div>(Please allow the Pop-ups in your browser for you to Sign-in)</div>
            <br/>It is recommended to use either Microsoft Edge or Google Chrome for the best experience!
        </div>
    )
}

export default Loader
