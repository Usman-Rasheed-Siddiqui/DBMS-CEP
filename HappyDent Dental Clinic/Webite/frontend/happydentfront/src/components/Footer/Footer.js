
import React from 'react';
import { 
  MDBFooter, 
  MDBContainer, 
  MDBRow, 
  MDBCol, 
  MDBIcon 
} from 'mdb-react-ui-kit';

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PrintIcon from '@mui/icons-material/Print';
import DiamondIcon from '@mui/icons-material/Diamond'

import HappyDentWordLogo from '../logos/HappyDent_word_logo.png';

import './Footer.css';

const Footer = () => {
  return (
    <MDBFooter 
    className='text-center text-lg-start text-muted'
    style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%',
        marginTop: 'auto',
        backgroundColor: '#ffffff'
      }}
      >
      <section className='d-flex justify-content-center justify-content-lg-between p-4 border-bottom'>
        <div className='me-5 d-none d-lg-block'
        style={{ padding: '10px 30px', color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold',}}>
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <a href='' className='me-4 text-reset'>
            <FacebookIcon/>
          </a>
          <a href='' className='me-4 text-reset'>
            <TwitterIcon/>
          </a>
          <a href='' className='me-4 text-reset'>
            <GoogleIcon/>
          </a>
          <a href='' className='me-4 text-reset'>
            <InstagramIcon/>
          </a>
          <a href='' className='me-4 text-reset'>
            <LinkedInIcon/>
          </a>
          <a href='' className='me-4 text-reset'>
            <GitHubIcon/>
          </a>
        </div>
      </section>

      <section className=''>
        <MDBContainer className='text-center text-md-start mt-5'>
          <MDBRow className='mt-3'>
            <MDBCol md="3" lg="4" xl="3" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>
                <MDBIcon icon="gem" className="me" />
                <img 
                    src={HappyDentWordLogo} 
                    alt="HappyDentWord Logo"
                    style = {{height: '20px'}}
                />
              </h6>
              <p>
                Dedicated to providing cutting-edge dental solutions with 
                a focus on patient comfort and long-term oral health. 
                HappyDent—where your smile is our priority.
              </p>
            </MDBCol>

            <MDBCol md="2" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4' style={{color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold',}}>Products</h6>
              <p><a href='#!' className='text-reset'>Cosmetic Dentistry</a></p>
              <p><a href='#!' className='text-reset'>Routine Checkups</a></p>
              <p><a href='#!' className='text-reset'>Dental Implants</a></p>
              <p><a href='#!' className='text-reset'>Teeth Whitening</a></p>
            </MDBCol>

            <MDBCol md="3" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4' style={{color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold',}}>Useful links</h6>
              <p><a href='#!' className='text-reset'>Book an Appointment</a></p>
              <p><a href='#!' className='text-reset'>Our Specialists</a></p>
              <p><a href='#!' className='text-reset'>FAQs</a></p>
            </MDBCol>

            <MDBCol md="4" lg="3" xl="3" className='mx-auto mb-md-0 mb-4'>
              <h6 className='text-uppercase fw-bold mb-4' style={{color: '#000000ff', fontSize: '1.1rem', fontWeight: 'bold',}}>Contact</h6>
              <p style={{color: '#000000ff'}}><MDBIcon icon="home" className="me-3" />4-C 16/A, Block 4 Nazimabad, Karachi</p>
              <p style={{color: '#000000ff'}}><MDBIcon icon="envelope" className="me-3" />happydent@gmail.com</p>
              <p style={{color: '#000000ff'}}><MDBIcon icon="phone" className="me-3" />+ 92 330 4537681</p>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      <div className='text-center p-4' style={{ color: '#000000ff', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        © {new Date().getFullYear()} Copyright: HappyDentServices
      </div>
    </MDBFooter>
  );
}

export default Footer;

