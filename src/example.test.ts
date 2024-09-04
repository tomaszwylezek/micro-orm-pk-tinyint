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
  // DriverException: alter table `foo`.`not_tiny` add constraint `not_tiny_tiny_id_foreign` foreign key (`tiny_id`) references `foo`.`with_tiny` (`tiny_id`) on update cascade; - Referencing column 'tiny_id' and referenced column 'tiny_id' in foreign key constraint 'not_tiny_tiny_id_foreign' are incompatible.
  await generator.updateSchema({ schema: 'foo' })

  // DB definitions

  // CREATE TABLE `with_tiny` (
  //   `tiny_id` int unsigned NOT NULL AUTO_INCREMENT, <---- NOTE: That should be tinyint
  //   `name` varchar(255) NOT NULL,
  //   PRIMARY KEY (`tiny_id`)
  // ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

  // CREATE TABLE `not_tiny` (
  //   `not_tiny_id` int unsigned NOT NULL AUTO_INCREMENT,
  //   `tiny_id` tinyint unsigned NOT NULL,  <---- NOTE: There is correct one
  //   PRIMARY KEY (`not_tiny_id`),
  //   KEY `not_tiny_tiny_id_index` (`tiny_id`)
  // ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
})
