import React, { Component } from 'react';

import { Menu, Tab, Table, Button, Icon, Input } from 'semantic-ui-react';

import { withTracker } from 'meteor/react-meteor-data';
import SpecialitiesCollection from '/imports/api/Staff/Specialities';
import { Bert } from 'meteor/themeteorchef:bert';

class Specialities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }
  renderSpecialities() {
    return this.props.specialities.map((speciality, index) => (
      <Table.Row key={speciality._id}>
        <Table.Cell>{speciality.name}</Table.Cell>
        <Table.Cell>{speciality.counter}</Table.Cell>
        <Table.Cell>
          <Button
            basic
            data-id={speciality._id}
            onClick={e => {
              let id = e.target.getAttribute('data-id');
              Meteor.call('Speciality.remove', id, (err, res) => {
                if (err) {
                  Bert.alert({
                    title: 'Ошибка удаления!',
                    message: err.reason,
                    type: 'danger',
                    style: 'growl-top-right',
                    icon: 'fa-user',
                  });
                } else {
                  Bert.alert({
                    title: 'Специальность удалена!',
                    message: 'Специальность успешно удалена из базы данных!',
                    type: 'success',
                    style: 'growl-top-right',
                    icon: 'fa-user',
                  });
                }
              });
            }}
          >
            <Icon name="trash" />
          </Button>
        </Table.Cell>
      </Table.Row>
    ));
  }

  generateInterimItems() {
    if (this.props.last > 2) {
      let buttons = [];
      for (let i = 2; i < this.props.last; i++) buttons.push(i);
      return buttons.map((button, index) => (
        <Menu.Item
          key={index}
          as="a"
          active={this.props.skip + 1 == button}
          onClick={e =>
            this.props.handleSkipChange('specialitiesSkip', button - 1)
          }
        >
          {button}
        </Menu.Item>
      ));
    }
    return '';
  }

  render() {
    return (
      <Tab.Pane>
        <h3>Специальности</h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            Meteor.call('Speciality.insert', this.state.name, (err, res) => {
              if (err) {
                Bert.alert({
                  title: 'Ошибка добавления!',
                  message: err.reason,
                  type: 'danger',
                  style: 'growl-top-right',
                  icon: 'fa-user',
                });
              } else {
                Bert.alert({
                  title: 'Успешно добавлена!',
                  message: 'Специальность успешно добавлена в базу данных!',
                  type: 'success',
                  style: 'growl-top-right',
                  icon: 'fa-user',
                });
                this.setState({ name: '' });
              }
            });
          }}
        >
          <Input
            style={{ width: '240px' }}
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
            placeholder="Название специальности"
          />
          <Button
            style={{ marginLeft: '16px' }}
            icon
            type="submit"
            labelPosition="left"
            secondary
          >
            Добавить специальность
            <Icon name="plus" />
          </Button>
        </form>
        <Table fixed celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Название</Table.HeaderCell>
              <Table.HeaderCell>Количество врачей</Table.HeaderCell>
              <Table.HeaderCell>Удалить</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderSpecialities()}</Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="3">
                Показываются с{' '}
                {this.props.total > 0 ? this.props.skip * 5 + 1 : 0} по{' '}
                {this.props.skip + 1 == this.props.last && this.props.last > 0
                  ? this.props.total
                  : (this.props.skip + 1) * 5}{' '}
                из {this.props.total} записей
                <Menu floated="right" pagination>
                  {this.props.skip > 0 && (
                    <Menu.Item
                      as="a"
                      icon
                      onClick={e => {
                        this.props.handleSkipChange(
                          'specialitiesSkip',
                          this.props.skip - 1,
                        );
                      }}
                    >
                      <Icon name="chevron left" />
                    </Menu.Item>
                  )}
                  {this.props.total > 5 && (
                    <Menu.Item
                      as="a"
                      active={this.props.skip + 1 == 1}
                      onClick={e =>
                        this.props.handleSkipChange('specialitiesSkip', 0)
                      }
                    >
                      1
                    </Menu.Item>
                  )}
                  {this.generateInterimItems()}
                  <Menu.Item
                    as="a"
                    active={this.props.skip + 1 == this.props.last}
                    onClick={e => {
                      this.props.handleSkipChange(
                        'specialitiesSkip',
                        this.props.last - 1,
                      );
                    }}
                  >
                    {this.props.last}
                  </Menu.Item>
                  {this.props.skip + 1 < this.props.last && (
                    <Menu.Item
                      as="a"
                      icon
                      onClick={e => {
                        this.props.handleSkipChange(
                          'specialitiesSkip',
                          this.props.skip + 1,
                        );
                      }}
                    >
                      <Icon name="chevron right" />
                    </Menu.Item>
                  )}
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Tab.Pane>
    );
  }
}

export default withTracker(props => {
  const subscription = Meteor.subscribe('AllSpecialities');
  const skip = props.skip || 0;
  const total = SpecialitiesCollection.find({}).count();

  return {
    loading: !subscription.ready(),
    total,
    handleSkipChange: props.handleSkipChange,
    last: Math.ceil(total / 5),
    specialities: SpecialitiesCollection.find(
      {},
      {
        skip: skip * 5,
        limit: 5,
      },
    ).fetch(),
  };
})(Specialities);
