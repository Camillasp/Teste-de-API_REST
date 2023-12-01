/// <reference types ="cypress"/>
import contrato from '../contratos/produtos.contratos'

describe('Testes da Funcionalidade Produtos', () => {
    let token

    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    })

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
        
    });

    it('Deve listar produtos com sucesso', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.body.produtos[20].nome).to.equal('Produto EBAC 80341815')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(10)
        })
    });

    it('Deve cadastrar produtos com sucesso', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 50,
                "descricao": "Produto Novo",
                "quantidade": 100
            },
            headers: { authorization: token }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Produto EBAC 48948051", 50, "Descrição do produto novo", 100)
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')
            })
    });

    it('Deve editar um produto previamente cadastrado ', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 500, "Descrição do produto novo", 125)
            .then(response => {
                let id = response.body._id

                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: { authorization: token },
                    body:
                    {
                        "nome": produto,
                        "preço": 45,
                        "descricao": "Produto Editado",
                        "quantidade": 12
                    },failOnStatusCode: false

                }).then(response => {
                    expect(response.status).to.equal(400)
                })
            })
       })
    })

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 250, "Descrição do produto novo", 180)
        .then(response => {
            let id = response.body._id

            cy.request({
                method: 'DELETE', 
                url: `produtos/${id}`, 
                headers: { authorization: token }
            }).then(response => {
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    });
