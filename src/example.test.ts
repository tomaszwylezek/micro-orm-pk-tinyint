import { ManyToOne, TinyIntType } from '@mikro-orm/core'
import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/mysql'

@Entity({ schema: 'foo', tableName: 'with_tiny' })
export class WithTiny {
  @PrimaryKey({ name: 'tiny_id', type: TinyIntType })
  id!: number

  @Property()
  name!: string
}

@Entity({ schema: 'foo', tableName: 'not_tiny' })
export class CasualEntity {
  @PrimaryKey({ name: 'not_tiny_id' })
  id!: number

  @ManyToOne(() => WithTiny, { fieldName: 'tiny_id' })
  tiny!: WithTiny
}

let orm: MikroORM

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: 'foo',
    host: '127.0.0.1',
    port: 9998,
    user: 'root',
    password: 'password',
    entities: [CasualEntity, WithTiny],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  })

  const generator = orm.getSchemaGenerator()

  await generator.dropDatabase('foo')
  await generator.createDatabase('foo')
})

afterAll(async () => {
  await orm.close(true)
})

test('should update schema without throwing on constraint because of wrong PK type (int whereas expected tinyint)', async () => {
  const generator = orm.getSchemaGenerator()

  // Throws on below
  await generator.updateSchema({ schema: 'foo' })

})
