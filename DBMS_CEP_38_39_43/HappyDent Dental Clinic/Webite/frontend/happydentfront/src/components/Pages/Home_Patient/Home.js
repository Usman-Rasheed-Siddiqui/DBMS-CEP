import React from 'react'

import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../../auth';

import ScrollStack, { ScrollStackItem } from '../../ServicesStack/ServicesStack';
import SplitText from "../../Text/Text"

import './Home.css'
import TiltedCard from '../../logoFront/logoFront';
import ShinyText from '../../welcomeText/welcomeText';
import SpotlightCard from '../../Achievement/Achievement';
import CountUp from '../../CountUp/CountUp';

import HappyDentLogo from '../../logos/HappyDent_logo.png'
import familyWellness from '../../logos/familyWellness.png'
import cosmeticCare from '../../logos/cosmeticCare.png'
import restoreReclaim from '../../logos/restoreReclaim.png'
import DoctorFemale from '../../logos/DoctorFemale.png';

const Home = () => {

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  const navigate = useNavigate();

  return (
    <>

      <div className="logo-card-wrapper">
        <TiltedCard
          imageSrc={HappyDentLogo}
          altText="HappyDent Clinic"
          captionText="HappyDent Clinic"
          containerHeight="300px"
          containerWidth="300px"
          imageHeight="300px"
          imageWidth="300px"
          rotateAmplitude={12}
          scaleOnHover={1.05}
          showMobileWarning={false}
          showTooltip
          displayOverlayContent
        />
      </div>

      <div className='welcome-text-wrapper'>
        <ShinyText
          text={
            <>
              Healthy teeth, happy hearts— <br />
              giving you the confidence to smile every day.
            </>
          }
          speed={5}
          delay={0}
          color="#000000"
          shineColor="#1564f7"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
          disabled={false}
        />
      </div>


      <div className="app-wrapper">

        {/* Services Text */}
        <div className="services-title-wrapper">
          <SplitText
            text="Our Services"
            className="text-2xl font-semibold text-center"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />

        </div>

        <div className="scroll-stack-wrapper">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={40}
            itemStackDistance={30}
            stackPosition="15%"
            itemScale={0.04}
            baseScale={0.85}
          >
            <ScrollStackItem>
              <div className="service-card-content">
                {/* Left Side: Image */}
                <div className="service-image-container">
                  <img src={familyWellness} alt="General Dentistry" className="service-img" />
                </div>

                {/* Right Side: Text */}
                <div className="service-text-container">
                  <span className="service-number">01</span>
                  <h2>Family Dental Wellness</h2>
                  <p>
                    Healthy teeth are the foundation of a happy life. Our comprehensive
                    general dentistry services focus on prevention, painless treatments,
                    and keeping your family's smiles bright year-round.
                  </p>
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="service-card-content">
                {/* Left Side: Image */}
                <div className="service-image-container">
                  <img src={cosmeticCare} alt="Cosmetic Care" className="service-img" />
                </div>

                {/* Right Side: Text */}
                <div className="service-text-container">
                  <span className="service-number">02</span>
                  <h2>The Smile You’ve Always Wanted</h2>
                  <p>
                    Your smile is your signature. Whether it's professional teeth whitening,
                    high-quality porcelain veneers, or subtle contouring, we combine artistry with modern technology.
                    Let us help you unlock a new level of confidence with a transformation tailored specifically to your
                    facial features.
                  </p>
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="service-card-content">
                {/* Left Side: Image */}
                <div className="service-image-container">
                  <img src={restoreReclaim} alt="Restorative & Specialized Care" className="service-img" />
                </div>

                {/* Right Side: Text */}
                <div className="service-text-container">
                  <span className="service-number">03</span>
                  <h2>Restore Function, Reclaim Life</h2>
                  <p>
                    Missing or damaged teeth shouldn't hold you back from enjoying the food you love.
                    We specialize in modern dental implants, durable crowns, and orthodontic solutions like
                    Invisalign. We don't just fix teeth; we restore your ability to eat, speak, and
                    laugh without a second thought.
                  </p>
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>

        <div className="staff-section-container">
          <SplitText
            text="Our Staff"
            className="text-2xl font-semibold text-center"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px" // Removed the -100px to ensure it triggers correctly
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
        </div>

        <div className='staff-cta-card' style = {{marginBottom: '80px' }}>
          <SpotlightCard className="custom-spotlight-card-2" spotlightColor="rgba(0, 229, 255, 0.2)">
            <p className="stat-label" style={{ color: '#ffffffff', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px auto' }}>
              Meet the dedicated professionals behind your smile. Get to know our experienced dental team, committed to providing compassionate and exceptional care for every patient.
            </p>
            <button 
            onClick={() => navigate('/doctor')}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Our Staff
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Our Achievements"
            className="text-2xl font-semibold text-center"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px" // Removed the -100px to ensure it triggers correctly
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
        </div>

        <div className="custom-spotlight-card">
          <SpotlightCard spotlightColor="rgba(0, 229, 255, 0.2)">
            <div className="stats-container">

              {/* 1. Years Experience */}
              <div className="stat-item">
                <div className="count-wrapper">
                  <CountUp from={0} to={15} duration={2} className="count-up-text" />+
                </div>
                <p className="stat-label">Years Experience</p>
              </div>

              {/* 2. Happy Patients */}
              <div className="stat-item">
                <div className="count-wrapper">
                  <CountUp from={0} to={5000} separator="," duration={2} className="count-up-text" />+
                </div>
                <p className="stat-label">Happy Patients</p>
              </div>

              {/* 3. Satisfaction Rate */}
              <div className="stat-item">
                <div className="count-wrapper">
                  <CountUp from={0} to={98} duration={2} className="count-up-text" />%
                </div>
                <p className="stat-label">Satisfaction Rate</p>
              </div>

              {/* 4. Services Offered */}
              <div className="stat-item">
                <div className="count-wrapper">
                  <CountUp from={0} to={10} duration={2} className="count-up-text" />+
                </div>
                <p className="stat-label">Services Offered</p>
              </div>

            </div>
          </SpotlightCard>
        </div>

        <div className="staff-section-container">
          <SplitText
            text="Book Now"
            className="text-2xl font-semibold text-center"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px" // Removed the -100px to ensure it triggers correctly
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
        </div>

        <div className='book-now-card' style = {{marginBottom: '80px' }}>
          <SpotlightCard className="custom-spotlight-card-2" spotlightColor="rgba(0, 229, 255, 0.2)">
            <p className="stat-label" style={{ color: '#ffffffff', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px auto' }}>
              Don't wait until a minor issue becomes a major problem. Take action now—secure your appointment today and let our experts provide the exceptional, pain-free care your smile deserves!
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/appointment');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              Book Appointment Now
            </button>
          </SpotlightCard>

        </div>

      </div>

    </>

  )
}



export default Home
