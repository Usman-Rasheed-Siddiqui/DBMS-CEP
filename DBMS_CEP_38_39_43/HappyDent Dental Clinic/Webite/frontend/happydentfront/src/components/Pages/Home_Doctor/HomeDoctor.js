import React from 'react'

import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../../auth';

import SplitText from "../../Text/Text"

import './HomeDoctor.css'
import TiltedCard from '../../logoFront/logoFront';
import SpotlightCard from '../../Achievement/Achievement';


import HappyDentLogo from '../../logos/HappyDent_logo.png'


const HomeDoctor = () => {
  console.log("DOCTOR PAGE TOKEN:", localStorage.getItem("token"));
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


      <div className="app-wrapper">

        <div className="staff-section-container">
          <SplitText
            text="View Appointments"
            className="text-2xl font-semibold text-center"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px" 
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
        </div>

        <div className='staff-cta-card' style = {{marginBottom: '80px' }}>
          <SpotlightCard className="custom-spotlight-card-2" spotlightColor="rgba(0, 229, 255, 0.2)">
            <p className="stat-label" style={{ color: '#ffffffff', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px auto' }}>
              View all patient's who have requested for an appointment here
            </p>
            <button 
            onClick={() => navigate('/appointment-tab')}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              Appointments Requested
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Update Patient Records"
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
              Add and update records of all patients you have appointed with.
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/patientrecords-doctor');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              Patient Records
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="View Your Salary Records"
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
              Track your salary records here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/staff-salary');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Salary
            </button>
          </SpotlightCard>

        </div>


        <div className="staff-section-container">
          <SplitText
            text="View All Patients"
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
              Track all patients here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/patient-doctor');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Patients
            </button>
          </SpotlightCard>

        </div>


      </div>

    </>

  )
}



export default HomeDoctor
