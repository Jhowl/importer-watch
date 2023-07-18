
import axios from 'axios'

class Controller {
  constructor() {
    this.init()
  }

  init() {
    this.setModel()
  }

  setModel() {
    this.Model = {}
  }

  async find(query) {
    try {
      const response = await this.Model.find(query)
      return response
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async insertMany(data) {
    try {
      const response = await this.Model.insertMany(data)
      return response
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async getLatest() {
    try {
      const response = await this.Model.find().sort({ matchId: -1 }).limit(1)
      return response
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async getQuery(query) {
    const url = `https://api.opendota.com/api/explorer?sql=${encodeURIComponent(query)}`

    try {
      const response = await axios.get(url)
      return response.data.rows
    }
    catch (error) {
      console.log(error)
      return false
    }

  }
}

export default Controller
