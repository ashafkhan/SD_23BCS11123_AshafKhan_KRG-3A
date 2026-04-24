import { Link } from 'react-router-dom';

function Footer() {
  return (
    <>
      <style>{`
        footer a{
          text-decoration: none;
          color: #938f8f;
        }
        footer .fb:hover{
          color: #4267B2;
        }
        footer .insta:hover{
          color: #a2446e;
        }
        footer .lkd:hover{
          color: #0e76a8;
        }
        footer .f-info, .about{
          background-color: rgb(52, 50, 50) !important;
        }
        footer{
          color: #d5d2d2;
        }
        .about{
          text-align: justify;
          padding: 1rem 7rem;
        }
      `}</style>
      <footer>
        <div className="about">
          <p style={{fontSize: '1.5rem'}}>About</p>
          Welcome to Shubh Yatra, the premier online travel platform designed to make your travel experiences seamless and memorable. Whether you're planning a weekend getaway or a long-term stay, Shubh Yatra offers a diverse range of accommodations tailored to suit your needs. With user-friendly search features, secure booking, and 24/7 customer support, your perfect trip is just a few clicks away. Discover new destinations, enjoy local hospitality, and embark on your next adventure with confidence through Shubh Yatra. Your journey starts here!
          <hr/>
        </div>
        <div className="f-info">
          <div className="f-info-socials">
            <Link to="/listings" className="fb">
              <i className="fa-brands fa-square-facebook"></i>
            </Link>
            <a href="https://www.instagram.com/tarun_aggarwal__" className="insta">
              <i className="fa-brands fa-square-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/tarun-aggarwal7/" className="lkd">
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
          <div style={{fontSize: '0.75rem'}}>Copyright &copy; 2024 All Right reserved by Shubh Yatra</div>
          <div className="f-info-links">
            <Link to="/listings">Privacy</Link>
            <Link to="/listings">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;

