import React from 'react';
import {Navbar, ListGroup} from 'react-bootstrap';
import {ApolloClient, InMemoryCache, gql} from '@apollo/client';


const APIURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";



const dataQuery = `
{
  transactions(orderBy: blockNumber, orderDirection: desc, first: 1000, where: { gasPrice_lte: 0  }){
    id
    timestamp
    blockNumber
    gasPrice
    swaps {
      id
      amountUSD
    }
  }
}
`;

const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache()
});

let getHumanReadableDate = function (epoch) {
    let date = new Date(0);
    date.setUTCSeconds(epoch);
    let readableString = date.toUTCString();
    if (readableString === "Invalid Date") {
        return ''
    }
    return readableString;
};

class App extends React.Component {
    state = {
        transactions: []
    };

    render() {
        return (
            <div>
                <Navbar className="navbar-custom" variant="dark">
                    <div style={{width: "90%"}}>
                        <Navbar.Brand href="/">
                            <b>Uniswap V3 MEV Explorer</b>
                        </Navbar.Brand>
                    </div>
                </Navbar>
                <div className="panel-landing  h-100 d-flex" id="section-1">
                    <br/>
                    {this.state.transactions.length === 0 &&
                    <h4>Fetching data ....</h4>
                    }
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.transactions.length > 0 &&
                            <div style={{marginBottom: "20px", height: "500px"}} className="transaction-list">
                                <h4><b>Transactions</b></h4>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px", marginBottom: "150px"}}>
                                    {this.state.transactions.map((transaction, i, transactions) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                            <br/>
                                            <b>Block Number</b>: {transaction.blockNumber}
                                            <br/>
                                            {transaction.swaps.length > 0 &&
                                             <div>
                                                 <b>First Swap Price (USD)</b>: {Number(transaction.swaps[0].amountUSD).toFixed(6)}
                                                 <br/>
                                                 {transaction.swaps.length > 1 && Number(transaction.swaps[transaction.swaps.length - 1].amountUSD) > 0 &&
                                                 <span><b>Last Swap Price (USD)</b>: {Number(transaction.swaps[transaction.swaps.length - 1].amountUSD).toFixed(6)}</span>
                                                 }
                                             </div>
                                            }

                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )

    }

    async componentWillMount() {

        client.query({
            query: gql(dataQuery)
        })
            .then(data => {
                console.log("Subgraph data: ", data);
                this.setState({
                    transactions: data.data.transactions
                })
            })
            .catch(err => {
                console.log("Error fetching other data: ", err)
            });

    }
}

export default App
