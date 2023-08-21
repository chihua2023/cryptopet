import { Row, Col, Container } from 'react-bootstrap'
import twitter from '@/assets/images/twitter.png'
import zhihu from '@/assets/images/zhihu.png'
import telegram from '@/assets/images/telegram.png'

import logo_public from '@/assets/images/logo_public.png'

import './index.css';

export const FootApp = () => { 
    return (
        <> <Container style={{width:'100%'}}>
        <Row className='bottom-hr'>
            <Col xs={6} className='left-area'>
              <span className='label'>Follow Us</span>
              
            <a href="https://t.me/zklinkhk">
              <img slot="reference" src={telegram} alt="telegram" width="25px" height="25px"/>
            </a>
              
            <a
              href="https://twitter.com/zklink_hk"
              target="_blank"
            ><img
              src={twitter}
              alt="twitter"
              width="25px"
              height="25px"
            /></a>
      
            <a
              href="https://www.zhihu.com/people/cha-na-73"
              target="_blank"
            ><img
              src={zhihu}
              alt="zhihu"
              width="25px"
              height="25px"
            /></a>
          </Col>
            <Col xs={6}  className='right-area'>
              7*24 Service Time
          </Col>
        </Row>
        
        <Row>
          <Col xs={6} className='left-area'>
            <div>
              <a href="https://zklink.hk">
                  <img  src={logo_public} alt="telegram" width="45px" height="45px"/>
              </a>
              <span className='logo_public-text'>ZKLINK</span>
            </div>
            <span className='slogan'>Find one-stop technical solutions for mining on ZKLink</span>

        </Col>
          <Col xs={6} className='right-area'>
          
            <div className='contact-us'>Contact us</div>
            <span><a href="mailto:contact@zklink.hk">contact@zklink.hk</a></span>
          
        </Col>
      </Row>
    </Container>
    </>
    )
}
