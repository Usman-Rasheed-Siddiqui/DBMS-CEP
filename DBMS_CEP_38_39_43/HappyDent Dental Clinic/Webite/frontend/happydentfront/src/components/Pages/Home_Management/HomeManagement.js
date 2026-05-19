import React from 'react'

import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../../auth';

import SplitText from "../../Text/Text"

import './HomeManagement.css'
import TiltedCard from '../../logoFront/logoFront';
import SpotlightCard from '../../Achievement/Achievement';


import HappyDentLogo from '../../logos/HappyDent_logo.png'


const HomeManagement = () => {
  const handleAnimationComplete = () => {
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
            text="Manage Staff"
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
              Manage All Staff here
            </p>
            <button 
            onClick={() => navigate('/staff-management')}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Staff
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Manage Patients"
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
              Manage All Patients here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/patient-whole-management');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Patients
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Manage Departments"
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
              Manage All Departments Here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/department-management');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Departments
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Manage Suppliers"
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
              Manage All Suppliers Here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/supplier-management');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Suppliers
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Manage Inventory"
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
              Manage All Inventory Here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/inventory-management');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Inventory
            </button>
          </SpotlightCard>

        </div>

        <div className="staff-section-container">
          <SplitText
            text="Manage Billing & Salary"
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
              Manage All Billings and Salary Here
            </p>
            <button 
            onClick={() => {
                    if (isAuthenticated()) {
                      navigate('/billing-salary-management');
                    } else {
                      navigate('/login');
                    }
                  }}
            style={{ padding: '10px 30px', backgroundColor: '#f6f6f6ff', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.39)' }}>
              View Billings & Salary
            </button>
          </SpotlightCard>

        </div>

      </div>

    </>

  )
}



export default HomeManagement
