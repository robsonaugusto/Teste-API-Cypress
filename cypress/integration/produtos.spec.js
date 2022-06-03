///<reference types="cypress" />
import contrato from '../contracts/produtos.contract'


describe('Testes da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it.only('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar Produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            //expect(response.body.produtos[2].nome).to.equal('Iphone X')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            
        })
    });

    it('Cadastrar produto', () => {
        let produto = `Iphone 11 256 ${Math.floor(Math.random() * 1000000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 4500,
                "descricao": "celular",
                "quantidade": 381
            },
            headers: { authorization: token }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')

        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, 'Iphone X 256', 4500, "Descrição do produto novo", 381)

            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')
            })
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: { authorization: token },
                body:
                {
                    "nome": "Iphone 12",
                    "preco": 4500,
                    "descricao": "Produto editado",
                    "quantidade": 381
                }
            }).then((response) => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve editar um produto cadastrado previamente ', () => {
        let produto = `Iphone 11 256 ${Math.floor(Math.random() * 1000000)}`
        cy.cadastrarProduto(token, produto, 4500, "Descrição do produto novo", 381)
            .then((response) => {
                let id = response.body._id

                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: { authorization: token },
                    body:
                    {
                        "nome": produto,
                        "preco": 6500,
                        "descricao": "Produto editado",
                        "quantidade": 381
                    }
                }).then((response) => {
                    //expect(response.status).to.equal(400)
                    expect(response.body.message).to.equal('Registro alterado com sucesso')
                })
            });
    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Iphone 11 256 ${Math.floor(Math.random() * 1000000)}`
        cy.cadastrarProduto(token, produto, 4500, "Descrição do produto novo", 381)
            .then((response) => {
                let id = response.body._id
                cy.request({
                    method: 'DELETE',
                    url: `produtos/${id}`,
                    headers: { authorization: token }
                }).then((response) => {
                    expect(response.body.message).to.equal('Registro excluído com sucesso')
                    expect(response.status).to.equal(200)
                })


            });
    });
});