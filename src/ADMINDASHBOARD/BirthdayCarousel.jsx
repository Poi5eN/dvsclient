import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import moment from "moment";
import confetti from "canvas-confetti";
// Import the audio file from the assets folder
import popSoundFile from "../assets/pop.wav";

const BirthdayCarousel = ({ allBday, today }) => {
  const confettiCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);
  const intervalRef = useRef(null);
  const soundRef = useRef();

  useEffect(() => {
    if (confettiCanvasRef.current) {
      confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }

    if (allBday?.length) {
      startConfetti();
      playPopSound();
    }

    return () => {
      stopConfetti();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBday]);

  const startConfetti = () => {
    stopConfetti(); // clear any existing interval
    intervalRef.current = setInterval(() => {
      confettiInstanceRef.current?.({
        particleCount: 5,
        angle: 60,
        spread: 45,
        origin: { x: 0.1, y: 0.6 },
      });
      confettiInstanceRef.current?.({
        particleCount: 5,
        angle: 120,
        spread: 45,
        origin: { x: 0.9, y: 0.6 },
      });
    }, 800);
  };

  const stopConfetti = () => {
    clearInterval(intervalRef.current);
  };

  const playPopSound = () => {
    if (!soundRef.current) {
      soundRef.current = new Audio(popSoundFile);
    }
    soundRef.current.volume = 0.4;
    soundRef.current.play().catch(() => {});
  };

  return (
    <div
      className="relative p-4 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg overflow-hidden"
      style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
    >
      <h1 className="text-[#33ace0] font-bold mb-4 text-md">
        TODAY' BIRTHDAYS🎈🎊
      </h1>

      {/* Confetti Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      />

      {/* Wrap the Swiper in a container with a higher z-index */}
      <div className="relative z-20">
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={true}
          // onSlideChange={() => playPopSound()}
        >
          {allBday?.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-md shadow bg-white dark:bg-gray-800 max-w-full mx-auto relative">
                <div className="flex-1 text-left">
                  <span className="inline-block mb-1 px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded">
                    {item.role}
                  </span>
                  <h4 className="font-bold text-lg">{item.studentName} 🎉</h4>
                  <p className="text-gray-600 font-medium text-sm">
                    Class: {item.class}-{item.section}
                  </p>
                  <p className="text-blue-800 font-bold text-sm">
                    {`${
                      Number(moment(today).format("YYYY")) -
                      Number(moment(item.dateOfBirth).format("YYYY"))
                    }th`}{" "}
                    Birthday 🎂 🎈
                  </p>
                </div>
                <img
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                  src={
                    item?.studentImage?.url ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"
                  }
                  alt="User Avatar"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BirthdayCarousel;
