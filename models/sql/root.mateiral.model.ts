import { Table, Column, Model, DataType, PrimaryKey, AllowNull, HasMany, AutoIncrement } from 'sequelize-typescript';
import LeafMaterial from './leaf.materials.model';
import LeafMaterialModel from './leaf.materials.model';

interface IRootMateiral {
    //idroot_material: number;
    root_name: string;
    version: number;
}

@Table({
    tableName: 'root_materials'
})
export default class RootMaterialModel extends Model<IRootMateiral> {

    @AutoIncrement
    @Column({
        primaryKey: true,
        allowNull: false
    })
    idroot_material!: number;

    @Column({
        allowNull: false
    })
    root_name!: string;

    @Column({
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        field: "updated_at",
    })
    updatedAt?: Date;

    @Column({
        defaultValue: 0,
        allowNull: false,
        type: DataType.INTEGER,
    })
    version!: number;

    @HasMany(() => LeafMaterialModel, 'root_materials_idroot_materials')
    leafMaterials?: LeafMaterialModel[];
}
