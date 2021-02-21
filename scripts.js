const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || [] // tranforma novamente em Array a String que geramos no metódo set()
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount // income = income + transaction.amount
            }
        })

        return income;
    },

    expenses() {
        //somar as saídas
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount
            }
        })
        return expense;
    },

    total() {
        //entradas - saídas
        return Transaction.incomes() + Transaction.expenses();
    },

    types_transaction() {
        let fixed_expenses = 0
        let variable_expenses = 0
        let life_style = 0
        let incomes = 0
        let total = Transaction.all.length

        Transaction.all.forEach(transaction => {
            if(transaction.type_transaction == 'fixed-expenses') {
                fixed_expenses += 1
            } else if(transaction.type_transaction == 'variable-expenses') {
                variable_expenses += 1
            } else if(transaction.type_transaction == 'life-style') {
                life_style += 1
            } else if(transaction.type_transaction == 'income') {
                incomes += 1
            }
        })

        let total_fixed_expenses = (fixed_expenses/total) * 100
        let total_variable_expenses = (variable_expenses/total) * 100
        let total_life_style = (life_style/total) * 100
        let total_incomes = (incomes/total) * 100
        
        return {
            total_fixed_expenses,
            total_variable_expenses,
            total_life_style,
            total_incomes
        }
    }

}



const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    type_transaction: document.querySelector('select#type-transaction'),


    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            type_transaction: Form.type_transaction.value
        }
    },


    validateFields() {
        const { description, amount, date, } = Form.getValues()

        if( description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date, type_transaction } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description, //description: description
            amount,
            date,
            type_transaction
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    updateType() {
        document
            .getElementById('incomesDisplay')
            .innerHTML = Transaction.types_transaction().total_incomes.toFixed(2) + "%"
        document
            .getElementById('expensesFixedDisplay')
            .innerHTML = Transaction.types_transaction().total_fixed_expenses.toFixed(2) + "%"
        document
            .getElementById('expensesVariableDisplay')
            .innerHTML = Transaction.types_transaction().total_variable_expenses.toFixed(2) + "%"
        document
            .getElementById('lifeStyleDisplay')
            .innerHTML = Transaction.types_transaction().total_life_style.toFixed(2) + "%"
    },

    submit(event) {
        event.preventDefault()

        try {
            //Form.validateFields()

            Form.formatValues()
            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Form.updateType()
            Modal.close();

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {

        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Form.updateType()

        Storage.set(Transaction.all)

    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
