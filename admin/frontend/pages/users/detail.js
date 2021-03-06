import React, { Component } from 'react'
import { branch } from 'baobab-react/higher-order'
import PropTypes from 'baobab-react/prop-types'
import api from '~base/api'
import moment from 'moment'
import env from '~base/env-variables'
import FontAwesome from 'react-fontawesome'

import Page from '~base/page'
import {loggedIn} from '~base/middlewares/'
import Loader from '~base/components/spinner'
import UserForm from './form'
import Multiselect from '~base/components/base-multiselect'

class UserDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      loading: true,
      resetLoading: false,
      resetText: 'Reset password',
      resetClass: 'button is-danger',
      user: {},
      roles: [],
      orgs: [],
      groups: [],
      selectedGroups: [],
      savingGroup: false,
      savedGroup: false,
      selectedOrgs: [],
      savingOrg: false,
      savedOrg: false
    }
  }

  componentWillMount () {
    this.load()
    this.loadRoles()
    this.loadOrgs()
    this.loadGroups()
  }

  async load () {
    var url = '/admin/users/' + this.props.match.params.uuid
    const body = await api.get(url)

    await this.setState({
      loading: false,
      loaded: true,
      user: body.data,
      selectedGroups: [...body.data.groups],
      selectedOrgs: [...body.data.organizations]
    })
  }

  async loadRoles () {
    var url = '/admin/roles/'
    const body = await api.get(
      url,
      {
        start: 0,
        limit: 0
      }
    )

    this.setState({
      ...this.state,
      roles: body.data
    })
  }

  async loadOrgs () {
    var url = '/admin/organizations/'
    const body = await api.get(
      url,
      {
        start: 0,
        limit: 0
      }
    )

    this.setState({
      ...this.state,
      orgs: body.data
    })
  }

  async loadGroups () {
    var url = '/admin/groups/'
    const body = await api.get(
      url,
      {
        start: 0,
        limit: 0
      }
    )

    this.setState({
      ...this.state,
      groups: body.data
    })
  }

  getDateCreated () {
    if (this.state.user.dateCreated) {
      return moment.utc(
        this.state.user.dateCreated
      ).format('DD/MM/YYYY hh:mm a')
    }

    return 'N/A'
  }

  async availableOrgOnClick (uuid) {
    this.setState({
      savingOrg: true
    })

    var selected = this.state.selectedOrgs
    var group = this.state.orgs.find(item => { return item.uuid === uuid })

    if (selected.findIndex(item => { return item.uuid === uuid }) !== -1) {
      return
    }

    selected.push(group)

    this.setState({
      selectedOrgs: selected
    })

    var url = '/admin/users/' + this.props.match.params.uuid + '/add/organization'
    await api.post(url,
      {
        organization: uuid
      }
    )

    setTimeout(() => {
      this.setState({
        savingOrg: false,
        savedOrg: true
      })
    }, 300)
  }

  async assignedOrgOnClick (uuid) {
    this.setState({
      savingOrg: true
    })

    var index = this.state.selectedOrgs.findIndex(item => { return item.uuid === uuid })
    var selected = this.state.selectedOrgs

    if (index === -1) {
      return
    }

    selected.splice(index, 1)

    this.setState({
      selectedOrgs: selected
    })

    var url = '/admin/users/' + this.props.match.params.uuid + '/remove/organization'
    await api.post(url,
      {
        organization: uuid
      }
    )

    setTimeout(() => {
      this.setState({
        savingOrg: false,
        savedOrg: true
      })
    }, 300)
  }

  async availableGroupOnClick (uuid) {
    this.setState({
      savingGroup: true
    })

    var selected = this.state.selectedGroups
    var group = this.state.groups.find(item => { return item.uuid === uuid })

    if (selected.findIndex(item => { return item.uuid === uuid }) !== -1) {
      return
    }

    selected.push(group)

    this.setState({
      selectedGroups: selected
    })

    var url = '/admin/users/' + this.props.match.params.uuid + '/add/group'
    await api.post(url,
      {
        group: uuid
      }
    )

    setTimeout(() => {
      this.setState({
        savingGroup: false,
        savedGroup: true
      })
    }, 300)
  }

  async assignedGroupOnClick (uuid) {
    this.setState({
      savingGroup: true
    })

    var index = this.state.selectedGroups.findIndex(item => { return item.uuid === uuid })
    var selected = this.state.selectedGroups

    if (index === -1) {
      return
    }

    selected.splice(index, 1)

    this.setState({
      selectedGroups: selected
    })

    var url = '/admin/users/' + this.props.match.params.uuid + '/remove/group'
    await api.post(url,
      {
        group: uuid
      }
    )

    setTimeout(() => {
      this.setState({
        savingGroup: false,
        savedGroup: true
      })
    }, 300)
  }

  async resetOnClick () {
    await this.setState({
      resetLoading: true,
      resetText: 'Sending email...',
      resetClass: 'button is-info'
    })

    var url = '/user/reset-password'

    try {
      await api.post(url, {email: this.state.user.email})
      setTimeout(() => {
        this.setState({
          resetLoading: true,
          resetText: 'Sucess!',
          resetClass: 'button is-success'
        })
      }, 3000)
    } catch (e) {
      await this.setState({
        resetLoading: true,
        resetText: 'Error!',
        resetClass: 'button is-danger'
      })
    }

    setTimeout(() => {
      this.setState({
        resetLoading: false,
        resetText: 'Reset Password',
        resetClass: 'button is-danger'
      })
    }, 10000)
    // this.load()
  }

  getSavingMessage (saving, saved) {
    if (saving) {
      return (
        <p className='card-header-title' style={{fontWeight: '200', color: 'grey'}}>
          Saving <span style={{paddingLeft: '5px'}}><FontAwesome className='fa-spin' name='spinner' /></span>
        </p>
      )
    }

    if (saved) {
      return (
        <p className='card-header-title' style={{fontWeight: '200', color: 'grey'}}>
          Saved
        </p>
      )
    }
  }

  getSavingGroupMessage () {
    let { savingGroup, savedGroup } = this.state

    if (savedGroup) {
      if (this.savedGroupTimeout) {
        clearTimeout(this.savedGroupTimeout)
      }

      this.savedGroupTimeout = setTimeout(() => {
        this.setState({
          savedGroup: false
        })
      }, 500)
    }

    return this.getSavingMessage(savingGroup, savedGroup)
  }

  getSavingOrgMessage () {
    let { savingOrg, savedOrg } = this.state

    if (savedOrg) {
      if (this.savedOrgTimeout) {
        clearTimeout(this.savedOrgTimeout)
      }

      this.savedOrgTimeout = setTimeout(() => {
        this.setState({
          savedOrg: false
        })
      }, 500)
    }

    return this.getSavingMessage(savingOrg, savedOrg)
  }

  render () {
    const { user } = this.state

    if (!user.uuid) {
      return <Loader />
    }

    const availableGroupsList = this.state.groups.filter(item => {
      return (this.state.selectedGroups.findIndex(group => {
        return group.uuid === item.uuid
      }) === -1)
    })

    const availableOrgsList = this.state.orgs.filter(item => {
      return (this.state.selectedOrgs.findIndex(org => {
        return org.uuid === item.uuid
      }) === -1)
    })

    var resetButton
    if (env.EMAIL_SEND) {
      resetButton = (
        <div className='columns'>
          <div className='column has-text-right'>
            <div className='field is-grouped is-grouped-right'>
              <div className='control'>
                <button
                  className={this.state.resetClass}
                  type='button'
                  onClick={() => this.resetOnClick()}
                  disabled={!!this.state.resetLoading}
                  >
                  {this.state.resetText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='columns c-flex-1 is-marginless'>
        <div className='column is-paddingless'>
          <div className='section'>
            {resetButton}
            <div className='columns is-mobile'>
              <div className='column'>
                <div className='card'>
                  <header className='card-header'>
                    <p className='card-header-title'>
                      { user.displayName }
                    </p>
                  </header>
                  <div className='card-content'>
                    <div className='columns'>
                      <div className='column'>
                        <UserForm
                          baseUrl='/admin/users'
                          url={'/admin/users/' + this.props.match.params.uuid}
                          initialState={this.state.user}
                          load={this.load.bind(this)}
                          roles={this.state.roles || []}
                        >
                          <div className='field is-grouped'>
                            <div className='control'>
                              <button className='button is-primary'>Save</button>
                            </div>
                          </div>
                        </UserForm>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='column'>
                <div className='columns'>
                  <div className='column'>
                    <div className='card'>
                      <header className='card-header'>
                        <p className='card-header-title'>
                          Organizations
                        </p>
                        <div>
                          {this.getSavingOrgMessage()}
                        </div>
                      </header>
                      <div className='card-content'>
                        <Multiselect
                          assignedList={this.state.selectedOrgs}
                          availableList={availableOrgsList}
                          dataFormatter={(item) => { return item.name || 'N/A' }}
                          availableClickHandler={this.availableOrgOnClick.bind(this)}
                          assignedClickHandler={this.assignedOrgOnClick.bind(this)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='columns'>
                  <div className='column'>
                    <div className='card'>
                      <header className='card-header'>
                        <p className='card-header-title'>
                          Groups
                        </p>
                        <div>
                          {this.getSavingGroupMessage()}
                        </div>
                      </header>
                      <div className='card-content'>
                        <Multiselect
                          assignedList={this.state.selectedGroups}
                          availableList={availableGroupsList}
                          dataFormatter={(item) => { return item.name || 'N/A' }}
                          availableClickHandler={this.availableGroupOnClick.bind(this)}
                          assignedClickHandler={this.assignedGroupOnClick.bind(this)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

UserDetail.contextTypes = {
  tree: PropTypes.baobab
}

const branchedUserDetail = branch({}, UserDetail)

export default Page({
  path: '/manage/users/:uuid',
  title: 'User details',
  exact: true,
  validate: loggedIn,
  component: branchedUserDetail
})
