import React, { PureComponent } from 'react';

import {
  Transaction,
  WalletAdapterNetwork,
  DecryptPermission,
  WalletNotConnectedError
} from "@demox-labs/aleo-wallet-adapter-base";
import './index.css'
import { Row, Col, Container, Card, Button,Modal } from 'react-bootstrap';
import jy from '@/assets/images/jiyin.svg';
import rest from '@/assets/images/rest.svg';



class PetList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: "",
      timer: null,
      publicKey: props.publicKey,
      isModelShow: false,
      show:false,
      record: [],
      adoptStatus: [],
      petDataObj: {},
      init_address: props.init_address,
      selectContract:'',
    };
  }
  componentWillMount() {
    this.getData();
    this.getNum();
  }
  componentDidMount() {
    this.state.timer = setInterval(() => {
      //需要定时执行的方法
      this.getData();
      this.getNum();
    }, 6000)
  }
  componentWillUnmount() {
    if (this.state.timer != null) {
      clearInterval(this.state.timer);
    }
  }
  // 领养
  handleClick = async (pet_info) => {
    const _this = this;
    if (!window.leoWallet.publicKey) {
      await this.onConnect();
      // throw new WalletNotConnectedError();
    }
    
//  adopter: address,pet_uid: u16, pet_type: u16
    const inputs = [window.leoWallet.publicKey, pet_info.Uid, pet_info.PetType];
    console.log("inputs",inputs)
    const fee = 10_000_000;

    const aleoTransaction = Transaction.createTransaction(
      window.leoWallet.publicKey,
      WalletAdapterNetwork.Testnet,
      'cryptopet.aleo',
      'adopt',
      inputs,
      fee
    );

    if ( window.leoWallet.requestTransaction) {
      // Returns a transaction Id, that can be used to check the status. Note this is not the on-chain transaction id
      await  window.leoWallet.requestTransaction(aleoTransaction).then(function (value) {
        console.log("value: ", value)
        _this.getData();
        return value
      }).catch((error) => { 
        console.log(JSON.stringify(error))
        console.log(error)
        this.handleShow();
      });
    }
  };
  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });
  handleModelClose = () => { 
    this.setState({ selectContract: '' });
    this.setState({isModelShow:false});
  }
  handleModelShow = (contract_id) => { 
    this.setState({ selectContract: contract_id });
    this.setState({ isModelShow: true });
    this.handleClick(contract_id)
  }
  handleModelSubmit = () => {
    this.handleModelClose();
  }
  handelModelError = () => { 

  }

  getData = async () => {
    const { petData } = this.props;
    if (window.leoWallet === undefined) { 
      return false;
    }
    let url = '/api/v1/pet/list/cryptopet.aleo';
    fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json()
        } else {
          return []
        }
      })
      .then(data => {
        let newData=data.data
        if(newData) {
          newData.map(item => {
            if (window.leoWallet?.publicKey == item.addr) {
              //宠物被我领养
              

              //反查 contract_id=''
              let pet_id = '';
              let pet = {};
              for (let index in petData) { 
                 pet = petData[index];
                if (pet.Uid_range.indexOf(item.pet_id)!=-1) { 
                  pet_id = pet.contract_id;
                  break;
                }
              }
              if (this.state.adoptStatus.indexOf(pet_id) == -1) {
                this.state.adoptStatus.push(pet_id)
                this.postAdopData(pet,item);

              }
              this.setState({ "adoptStatus": this.state.adoptStatus })
              
            }
          })
        }
      })
      .catch((error) => console.log(error))
  };


  postAdopData = (pet, pet_info) => { 

    let url = '/api/v1/pet/adopt';
    let data = {
      pet_type: pet.contract_id,
      pet_uid: pet_info.pet_id,
      name: pet.name,
      birthday: pet.birthday,
      sex: pet.sex,
      adopter:pet_info.addr
    };
    fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(data)
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json()
        } else {
          return []
        }
      }).then(data => { 
        console.log(data)
      }).catch((error) => console.log(error))
  }

  getNum = async () => {
    let url = '/api/v1/pet/getstate';
    const _this = this;
    fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json()
        } else {
          return []
        }
      })
      .then(data => {
        let newData = data.data
        let petObj = {};
        if (newData) {
          newData.map(item => {
            // let contract_id = ;
            petObj[item.PetType] = item;
            // console.log(petObj)
          })

          _this.setState({petDataObj:petObj})
        }
      })
      .catch((error) => console.log(error))
  };
  
  // 在事件处理程序中进行编程式导航
  handleDetailButtonClick = (pet_id) => {
    window.open(`/detail/${pet_id}`)
  };

  ButtonShow = (current_item, pet_info) => {

    if(this.state.adoptStatus.indexOf(current_item.contract_id) != -1) { 
      return <div className='btn-box'>
        <Button  variant="success" className='success_icon' disabled={true}>Success</Button>
        <Button  variant="success" type='default' className='detail_icon'  onClick={()=>this.handleDetailButtonClick(current_item.id)} >Detail</Button></div>
    }   
    else if (pet_info?.Count==0) { 
      return <div className='btn-box'>
      <Button variant="secondary" className='adopt_icon' disabled={true}>Empty</Button>
      <Button type='default' className='detail_icon' onClick={()=>this.handleDetailButtonClick(current_item.id)} >Detail</Button>
      </div>
    }
    else{
      return <div className='btn-box'>
        <Button variant="primary" className='adopt_icon' onClick={() => this.handleClick(pet_info)} disabled={!window.leoWallet || window.leoWallet?.publicKey == undefined}>Adopt</Button>
      <Button type='default' className='detail_icon' onClick={()=>this.handleDetailButtonClick(current_item.id)} >Detail</Button>
      </div>
    }     
  }

  renderCell = () => { 
    const { petData } = this.props;
    const { petDataObj } = this.state;
    return petData.map((item) => {
      let count = 0;
      let uid = ''
      let pet_info = {};
      if (petDataObj[item.contract_id] !== undefined) { 
        pet_info = petDataObj[item.contract_id];
        count = petDataObj[item.contract_id]["Count"];
        uid= petDataObj[item.contract_id]["Uid"];
      }
      return (
        <Col xs={4} md={3} key={item.name} className='justify'>
          <Card style={{ width: '18rem',marginBottom:'20px'}}>
            <Card.Img variant="top" src={item.picture} />
            <Card.Body>
            <Card.Title style={{textAlign:'left'}}># {item.id + 15232}</Card.Title>
              <Card.Text style={{ textAlign: 'left', fontSize: '14px', paddingBottom: '35px' }}>
                <Row>
                  {/* <Col xs={12} className="pet-main"> <strong ># {item.id + 15232}</strong></Col> */}
                    <Col xs={12}>
                      <span className="pet-breed">
                        <img src={jy} className='subTitleIcon'></img>{item.series}
                      </span>
                      <span className="pet-breed">
                        <img src={rest} className='subTitleIcon'></img> Rest Time(5h)
                    </span><br></br>
                     <span className="pet-breed">
                      Amount:{count}<br></br>
                      </span>
                  </Col>
                </Row>
                 {/* <strong>Breed</strong>: <span className="pet-breed">{ item.breed}</span><br />
                  <strong>Age</strong>: <span className="pet-age">{ item.age}</span><br />
                  <strong>Location</strong>: <span className="pet-location">{ item.location}</span> */}
              </Card.Text>
              {this.ButtonShow(item,pet_info)}
            </Card.Body>
          </Card>
        </Col>
      )
    })
  }

  renderModelCell = () => { 
    return (<>
      <Modal show={this.state.isModelShow} onHide={this.handleModelClose}>
        <Modal.Header closeButton>
          <Modal.Title>Adopt a Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2>Create a pet name</h2>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleModelClose}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleModelSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

       <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>LEO wallet recharge</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your account must have money to adopt. Go to LEO wallet Extention, click on the faucet, and collect the test coin!<br></br>
          <a href='/faq'>Leo Wallet Recharge</a>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button> */}
          <Button variant="primary" onClick={this.handleClose}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    )
  }

  onConnect = () => { 
    const _this = this
    const { setPublicAddress } = _this.props;
  if (window.leoWallet.publicKey == undefined) { 
      window.leoWallet.connect(DecryptPermission.AutoDecrypt, WalletAdapterNetwork.Testnet).then(() => {
        setPublicAddress(window.leoWallet.publicKey);
      }).catch((error) => console.log(error))
  }
  }


  render() {
    return (
      <>
      <Container>
        {/* <h1 style={{ paddingTop: "50px", paddingBottom: "50px" }}>Pete's Pet Shop</h1> */}
          <Row id="petTemplate" className='baseLayout'>
            <Col xs={12} md={12} style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* <WalletConnectButton /> */}
             {/* <Button onClick={this.onConnect}>
              Start
            </Button> */}
{/* --
             <Button onClick={this.disConnect}>
              DisConnect    
            </Button>
            -- */}
            </Col>
          </Row>
          <Row id="petTemplate" className='baseLayout'>
            { this.renderCell()}
            {this.renderModelCell()}
                               
          </Row>
      </Container>
    </>
  );
  }
}

export default PetList;



